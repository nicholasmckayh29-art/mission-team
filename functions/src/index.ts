import {initializeApp} from "firebase-admin/app";
import {getFirestore, FieldValue, Timestamp} from "firebase-admin/firestore";
import {getMessaging} from "firebase-admin/messaging";
import {HttpsError, onCall} from "firebase-functions/v2/https";
import {onSchedule} from "firebase-functions/v2/scheduler";

initializeApp();

const db = getFirestore();

type Role = "member" | "admin" | "super_admin";
type MemberStatus = "active" | "invited" | "removed";
type ContactStatus = "follow_up" | "forgotten" | "faithful" | "backburner";

const ROLES: Role[] = ["member", "admin", "super_admin"];

function uidFromRequest(request: { auth?: { uid: string } | null }): string {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Sign in is required.");
  }
  return uid;
}

function requiredString(value: unknown, field: string, maxLength = 200): string {
  if (typeof value !== "string") {
    throw new HttpsError("invalid-argument", `${field} must be a string.`);
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) {
    throw new HttpsError("invalid-argument", `${field} is required and must be ${maxLength} characters or fewer.`);
  }
  return trimmed;
}

function optionalString(value: unknown, field: string, maxLength = 2000): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    throw new HttpsError("invalid-argument", `${field} must be a string.`);
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new HttpsError("invalid-argument", `${field} must be ${maxLength} characters or fewer.`);
  }
  return trimmed;
}

function optionalNumber(value: unknown, field: string, min: number, max: number): number | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== "number" || Number.isNaN(value) || value < min || value > max) {
    throw new HttpsError("invalid-argument", `${field} must be a number from ${min} to ${max}.`);
  }
  return value;
}

function normalizeCommunityCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function generateCommunityCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

function approximateCoordinate(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function requireLatLng(data: Record<string, unknown>): { lat: number; lng: number } {
  const lat = optionalNumber(data.lat, "lat", -90, 90);
  const lng = optionalNumber(data.lng, "lng", -180, 180);
  if (lat === null || lng === null) {
    throw new HttpsError("invalid-argument", "lat and lng are required.");
  }
  return {
    lat: approximateCoordinate(lat),
    lng: approximateCoordinate(lng),
  };
}

function geocell(lat: number, lng: number): string {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function isAllowedRole(value: unknown): value is Role {
  return typeof value === "string" && ROLES.includes(value as Role);
}

async function getActiveMemberRole(communityId: string, uid: string): Promise<Role> {
  const memberSnap = await db.doc(`communities/${communityId}/members/${uid}`).get();
  if (!memberSnap.exists || memberSnap.get("status") !== "active") {
    throw new HttpsError("permission-denied", "Active community membership is required.");
  }
  return memberSnap.get("role") as Role;
}

async function requireCommunityAdmin(communityId: string, uid: string): Promise<Role> {
  const role = await getActiveMemberRole(communityId, uid);
  if (role !== "admin" && role !== "super_admin") {
    throw new HttpsError("permission-denied", "Community admin permission is required.");
  }
  return role;
}

async function writeAuditLog(
  action: string,
  actorUserId: string,
  target: Record<string, unknown>,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  await db.collection("auditLogs").add({
    action,
    actorUserId,
    target,
    metadata,
    createdAt: FieldValue.serverTimestamp(),
  });
}

async function createNotification(
  targetUserId: string,
  type: string,
  title: string,
  body: string,
  relatedEntity: Record<string, unknown> = {},
): Promise<void> {
  await db.collection(`users/${targetUserId}/notifications`).add({
    type,
    title,
    body,
    relatedEntity,
    readAt: null,
    createdAt: FieldValue.serverTimestamp(),
  });

  await sendPushToUser(targetUserId, title, body, relatedEntity);
}

async function sendPushToUser(
  targetUserId: string,
  title: string,
  body: string,
  data: Record<string, unknown> = {},
): Promise<void> {
  const tokenSnap = await db.collection(`users/${targetUserId}/pushTokens`).get();
  const tokens = tokenSnap.docs
    .map((doc) => doc.get("token"))
    .filter((token): token is string => typeof token === "string" && token.length > 0);

  if (tokens.length === 0) {
    return;
  }

  await getMessaging().sendEachForMulticast({
    tokens,
    notification: {title, body},
    data: Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, String(value)]),
    ),
  });
}

async function activeCommunityMemberIds(communityIds: string[], excludeUid?: string): Promise<string[]> {
  const userIds = new Set<string>();
  for (const communityId of communityIds) {
    const membersSnap = await db
      .collection(`communities/${communityId}/members`)
      .where("status", "==", "active" satisfies MemberStatus)
      .get();
    membersSnap.docs.forEach((doc) => {
      if (doc.id !== excludeUid) {
        userIds.add(doc.id);
      }
    });
  }
  return [...userIds];
}

function profilePatch(data: Record<string, unknown>, authEmail?: string): Record<string, unknown> {
  return {
    displayName: optionalString(data.displayName, "displayName", 120),
    firstName: optionalString(data.firstName, "firstName", 80),
    email: optionalString(data.email, "email", 320) ?? authEmail ?? null,
    birthday: optionalString(data.birthday, "birthday", 20),
    gender: optionalString(data.gender, "gender", 40),
    photoURL: optionalString(data.photoURL, "photoURL", 1000),
    notificationSettings: typeof data.notificationSettings === "object" && data.notificationSettings !== null
      ? data.notificationSettings
      : {
        followUpReminders: true,
        communityInvites: true,
        faithAlerts: true,
        challenges: true,
      },
    onboardingComplete: true,
    accountStatus: "active",
    updatedAt: FieldValue.serverTimestamp(),
  };
}

export const createUserProfile = onCall(async (request) => {
  const uid = uidFromRequest(request);
  const data = (request.data ?? {}) as Record<string, unknown>;
  const userRef = db.doc(`users/${uid}`);

  await userRef.set({
    ...profilePatch(data, request.auth?.token.email as string | undefined),
    createdAt: FieldValue.serverTimestamp(),
  }, {merge: true});

  return {userId: uid};
});

export const createCommunity = onCall(async (request) => {
  const uid = uidFromRequest(request);
  const data = (request.data ?? {}) as Record<string, unknown>;
  const name = requiredString(data.name, "name", 120);
  const description = optionalString(data.description, "description", 1000);
  const imageUrl = optionalString(data.imageUrl, "imageUrl", 1000);
  const restrictions = typeof data.restrictions === "object" && data.restrictions !== null
    ? data.restrictions
    : {};
  const communityRef = db.collection("communities").doc();
  const communityCode = generateCommunityCode();
  const codeRef = db.doc(`communityCodes/${communityCode}`);

  await db.runTransaction(async (tx) => {
    const codeSnap = await tx.get(codeRef);
    if (codeSnap.exists) {
      throw new HttpsError("aborted", "Community code collision. Please try again.");
    }

    tx.set(communityRef, {
      name,
      description,
      imageUrl,
      createdBy: uid,
      communityCode,
      restrictions,
      memberCount: 1,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    tx.set(communityRef.collection("members").doc(uid), {
      role: "super_admin" satisfies Role,
      status: "active" satisfies MemberStatus,
      joinedAt: FieldValue.serverTimestamp(),
      invitedBy: null,
    });
    tx.set(codeRef, {
      communityId: communityRef.id,
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  await writeAuditLog("community.created", uid, {communityId: communityRef.id});
  return {communityId: communityRef.id, communityCode};
});

export const joinCommunity = onCall(async (request) => {
  const uid = uidFromRequest(request);
  const data = (request.data ?? {}) as Record<string, unknown>;
  const rawCode = requiredString(data.communityCode, "communityCode", 40);
  const communityCode = normalizeCommunityCode(rawCode);
  const codeSnap = await db.doc(`communityCodes/${communityCode}`).get();

  if (!codeSnap.exists) {
    throw new HttpsError("not-found", "Community code was not found.");
  }

  const communityId = codeSnap.get("communityId") as string;
  const communityRef = db.doc(`communities/${communityId}`);
  const memberRef = communityRef.collection("members").doc(uid);

  await db.runTransaction(async (tx) => {
    const [communitySnap, memberSnap] = await Promise.all([
      tx.get(communityRef),
      tx.get(memberRef),
    ]);

    if (!communitySnap.exists) {
      throw new HttpsError("not-found", "Community was not found.");
    }

    if (memberSnap.exists && memberSnap.get("status") === "active") {
      return;
    }

    tx.set(memberRef, {
      role: "member" satisfies Role,
      status: "active" satisfies MemberStatus,
      joinedAt: FieldValue.serverTimestamp(),
      invitedBy: null,
    }, {merge: true});
    tx.update(communityRef, {
      memberCount: FieldValue.increment(memberSnap.exists ? 0 : 1),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  await writeAuditLog("community.joined", uid, {communityId});
  return {communityId};
});

export const inviteMember = onCall(async (request) => {
  const uid = uidFromRequest(request);
  const data = (request.data ?? {}) as Record<string, unknown>;
  const communityId = requiredString(data.communityId, "communityId", 120);
  const targetUserId = requiredString(data.targetUserId, "targetUserId", 120);
  await requireCommunityAdmin(communityId, uid);

  const inviteRef = db.collection(`communities/${communityId}/invites`).doc();
  await inviteRef.set({
    targetUserId,
    invitedBy: uid,
    status: "pending",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await createNotification(
    targetUserId,
    "invite",
    "Community invite",
    "You were invited to join a Mission Team community.",
    {communityId, inviteId: inviteRef.id},
  );
  await writeAuditLog("community.invite_created", uid, {communityId, targetUserId, inviteId: inviteRef.id});
  return {inviteId: inviteRef.id};
});

export const updateMemberRole = onCall(async (request) => {
  const uid = uidFromRequest(request);
  const data = (request.data ?? {}) as Record<string, unknown>;
  const communityId = requiredString(data.communityId, "communityId", 120);
  const targetUserId = requiredString(data.targetUserId, "targetUserId", 120);
  const newRole = data.role;

  if (!isAllowedRole(newRole)) {
    throw new HttpsError("invalid-argument", "role must be member, admin, or super_admin.");
  }

  const actorRole = await requireCommunityAdmin(communityId, uid);
  const memberRef = db.doc(`communities/${communityId}/members/${targetUserId}`);
  const memberSnap = await memberRef.get();

  if (!memberSnap.exists || memberSnap.get("status") !== "active") {
    throw new HttpsError("not-found", "Active member was not found.");
  }

  const currentRole = memberSnap.get("role") as Role;
  if ((newRole === "super_admin" || currentRole === "super_admin") && actorRole !== "super_admin") {
    throw new HttpsError("permission-denied", "Only a super admin can change super admin roles.");
  }

  await memberRef.update({
    role: newRole,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: uid,
  });

  await createNotification(
    targetUserId,
    "admin_request",
    "Community role updated",
    "Your Mission Team community role was updated.",
    {communityId, role: newRole},
  );
  await writeAuditLog("community.role_updated", uid, {communityId, targetUserId}, {from: currentRole, to: newRole});
  return {communityId, targetUserId, role: newRole};
});

export const removeMember = onCall(async (request) => {
  const uid = uidFromRequest(request);
  const data = (request.data ?? {}) as Record<string, unknown>;
  const communityId = requiredString(data.communityId, "communityId", 120);
  const targetUserId = requiredString(data.targetUserId, "targetUserId", 120);
  const actorRole = await requireCommunityAdmin(communityId, uid);
  const memberRef = db.doc(`communities/${communityId}/members/${targetUserId}`);
  const memberSnap = await memberRef.get();

  if (!memberSnap.exists || memberSnap.get("status") !== "active") {
    throw new HttpsError("not-found", "Active member was not found.");
  }

  if (memberSnap.get("role") === "super_admin" && actorRole !== "super_admin") {
    throw new HttpsError("permission-denied", "Only a super admin can remove a super admin.");
  }

  await db.runTransaction(async (tx) => {
    tx.update(memberRef, {
      status: "removed" satisfies MemberStatus,
      removedAt: FieldValue.serverTimestamp(),
      removedBy: uid,
    });
    tx.update(db.doc(`communities/${communityId}`), {
      memberCount: FieldValue.increment(-1),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  await createNotification(
    targetUserId,
    "admin_request",
    "Community access updated",
    "Your Mission Team community access was updated.",
    {communityId},
  );
  await writeAuditLog("community.member_removed", uid, {communityId, targetUserId});
  return {communityId, targetUserId, status: "removed"};
});

export const activateFaithMode = onCall(async (request) => {
  const uid = uidFromRequest(request);
  const data = (request.data ?? {}) as Record<string, unknown>;
  const safetyAccepted = data.safetyAccepted === true;
  if (!safetyAccepted) {
    throw new HttpsError("failed-precondition", "Faith Mode safety warning must be accepted.");
  }

  const communityIds = Array.isArray(data.communityIds)
    ? data.communityIds.map((id) => requiredString(id, "communityIds[]", 120))
    : [];
  if (communityIds.length === 0 || communityIds.length > 10) {
    throw new HttpsError("invalid-argument", "At least one and no more than ten communities are required.");
  }

  await Promise.all(communityIds.map((communityId) => getActiveMemberRole(communityId, uid)));

  const {lat, lng} = requireLatLng(data);
  const requestedDuration = optionalNumber(data.durationMinutes, "durationMinutes", 15, 120) ?? 90;
  const now = new Date();
  const expiresAt = addMinutes(now, requestedDuration);
  const visibleToUserIds = await activeCommunityMemberIds(communityIds, uid);
  const presenceRef = db.doc(`faithPresence/${uid}`);

  await presenceRef.set({
    userId: uid,
    communityIds,
    lat,
    lng,
    geocell: geocell(lat, lng),
    accuracy: "approximate",
    visibleToUserIds,
    safetyAcceptedAt: FieldValue.serverTimestamp(),
    startedAt: FieldValue.serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
    lastUpdatedAt: FieldValue.serverTimestamp(),
    status: "active",
  });

  await db.doc(`users/${uid}`).set({
    faithModeStatus: "active",
    updatedAt: FieldValue.serverTimestamp(),
  }, {merge: true});

  await Promise.all(visibleToUserIds.map((targetUserId) => createNotification(
    targetUserId,
    "faith_alert",
    "Faith Mode active",
    "A brother is available to share faith nearby.",
    {presenceId: presenceRef.id},
  )));
  await writeAuditLog("faith_mode.activated", uid, {presenceId: presenceRef.id}, {communityIds});
  return {presenceId: presenceRef.id, expiresAt: expiresAt.toISOString(), visibleToCount: visibleToUserIds.length};
});

export const updateFaithLocation = onCall(async (request) => {
  const uid = uidFromRequest(request);
  const data = (request.data ?? {}) as Record<string, unknown>;
  const {lat, lng} = requireLatLng(data);
  const presenceRef = db.doc(`faithPresence/${uid}`);
  const presenceSnap = await presenceRef.get();

  if (!presenceSnap.exists || presenceSnap.get("status") !== "active") {
    throw new HttpsError("failed-precondition", "No active Faith Mode session was found.");
  }

  const expiresAt = presenceSnap.get("expiresAt") as Timestamp;
  if (expiresAt.toDate().getTime() <= Date.now()) {
    await presenceRef.update({
      status: "expired",
      lastUpdatedAt: FieldValue.serverTimestamp(),
    });
    throw new HttpsError("failed-precondition", "Faith Mode session has expired.");
  }

  await presenceRef.update({
    lat,
    lng,
    geocell: geocell(lat, lng),
    lastUpdatedAt: FieldValue.serverTimestamp(),
  });

  return {presenceId: presenceRef.id};
});

export const deactivateFaithMode = onCall(async (request) => {
  const uid = uidFromRequest(request);
  const presenceRef = db.doc(`faithPresence/${uid}`);

  await presenceRef.set({
    userId: uid,
    status: "cancelled",
    endedAt: FieldValue.serverTimestamp(),
    lastUpdatedAt: FieldValue.serverTimestamp(),
    visibleToUserIds: [],
  }, {merge: true});

  await db.doc(`users/${uid}`).set({
    faithModeStatus: "off",
    updatedAt: FieldValue.serverTimestamp(),
  }, {merge: true});

  await writeAuditLog("faith_mode.deactivated", uid, {presenceId: presenceRef.id});
  return {presenceId: presenceRef.id, status: "cancelled"};
});

export const runFollowUpReminderScan = onSchedule("every 60 minutes", async () => {
  const now = Timestamp.now();
  const dueContacts = await db
    .collectionGroup("contacts")
    .where("nextReminderAt", "<=", now)
    .where("status", "in", ["follow_up", "forgotten"] satisfies ContactStatus[])
    .limit(250)
    .get();

  await Promise.all(dueContacts.docs.map(async (contactSnap) => {
    const userRef = contactSnap.ref.parent.parent;
    if (!userRef) {
      return;
    }

    const userId = userRef.id;
    const contactName = contactSnap.get("name") ?? "a contact";
    const currentStrikeCount = Number(contactSnap.get("strikeCount") ?? 0);
    const nextStrikeCount = currentStrikeCount + 1;
    const nextStatus: ContactStatus = nextStrikeCount >= 3 ? "forgotten" : "follow_up";

    await contactSnap.ref.update({
      strikeCount: nextStrikeCount,
      status: nextStatus,
      nextReminderAt: Timestamp.fromDate(addMinutes(new Date(), 2 * 24 * 60)),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await createNotification(
      userId,
      "follow_up",
      "Follow-up reminder",
      `Remember to follow up with ${contactName}.`,
      {contactId: contactSnap.id},
    );
  }));
});

export const expireFaithPresence = onSchedule("every 15 minutes", async () => {
  const now = Timestamp.now();
  const expiredSnap = await db
    .collection("faithPresence")
    .where("status", "==", "active")
    .where("expiresAt", "<=", now)
    .limit(250)
    .get();

  await Promise.all(expiredSnap.docs.map(async (presenceSnap) => {
    const userId = presenceSnap.get("userId") as string;
    await presenceSnap.ref.update({
      status: "expired",
      visibleToUserIds: [],
      lastUpdatedAt: FieldValue.serverTimestamp(),
    });
    await db.doc(`users/${userId}`).set({
      faithModeStatus: "off",
      updatedAt: FieldValue.serverTimestamp(),
    }, {merge: true});
  }));
});
