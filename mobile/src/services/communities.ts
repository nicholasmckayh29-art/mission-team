import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';

import { auth, db } from '../config/firebase';
import { saveCommunityIconLocally } from './communityIcon';
import type {
  Community,
  CommunityCodePreview,
  CommunityMember,
  CommunityMembership,
  CommunityRestrictions,
  CommunityRole,
  UserProfile,
} from '../types';
import { validateProfileForCommunity } from '../utils/communityRestrictions';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const EMPTY_RESTRICTIONS: CommunityRestrictions = {
  gender: null,
  minimumAge: null,
};

function requireUserId(): string {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('You must be signed in to manage communities.');
  }

  return userId;
}

function membershipsCollection(userId: string) {
  return collection(db, 'users', userId, 'communityMemberships');
}

function membershipRef(userId: string, communityId: string) {
  return doc(db, 'users', userId, 'communityMemberships', communityId);
}

function communityRef(communityId: string) {
  return doc(db, 'communities', communityId);
}

function membersCollection(communityId: string) {
  return collection(db, 'communities', communityId, 'members');
}

function memberRef(communityId: string, memberId: string) {
  return doc(db, 'communities', communityId, 'members', memberId);
}

function communityCodeRef(code: string) {
  return doc(db, 'communityCodes', code.toUpperCase());
}

export function normalizeCommunityRestrictions(raw: unknown): CommunityRestrictions {
  if (!raw || typeof raw !== 'object') {
    return EMPTY_RESTRICTIONS;
  }

  const value = raw as Record<string, unknown>;

  return {
    gender: value.gender === 'male' || value.gender === 'female' ? value.gender : null,
    minimumAge: typeof value.minimumAge === 'number' ? value.minimumAge : null,
  };
}

export function generateCommunityCode(length = 6): string {
  let code = '';
  for (let index = 0; index < length; index += 1) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }

  return code;
}

export function subscribeCommunityMemberships(
  onChange: (memberships: CommunityMembership[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const userId = requireUserId();
  const membershipsQuery = query(membershipsCollection(userId), orderBy('joinedAt', 'desc'));

  return onSnapshot(
    membershipsQuery,
    (snapshot) => {
      const memberships = snapshot.docs.map((document) => {
        const data = document.data() as Omit<CommunityMembership, 'id' | 'communityId'>;

        return {
          id: document.id,
          communityId: document.id,
          ...data,
          imageUrl: data.imageUrl ?? '',
        };
      });

      onChange(memberships);
    },
    (error) => {
      onError?.(error);
    },
  );
}

export function subscribeCommunityMembers(
  communityId: string,
  onChange: (members: CommunityMember[]) => void,
): Unsubscribe {
  const membersQuery = query(membersCollection(communityId), orderBy('joinedAt', 'asc'));

  return onSnapshot(membersQuery, (snapshot) => {
    const members = snapshot.docs.map((document) => ({
      id: document.id,
      userId: document.id,
      ...(document.data() as Omit<CommunityMember, 'id' | 'userId'>),
    }));

    onChange(members);
  });
}

export async function getCommunity(communityId: string): Promise<Community | null> {
  const snapshot = await getDoc(communityRef(communityId));
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as Omit<Community, 'id' | 'restrictions' | 'imageUrl'> & {
    restrictions?: unknown;
    imageUrl?: string;
  };

  return {
    id: snapshot.id,
    ...data,
    restrictions: normalizeCommunityRestrictions(data.restrictions),
    imageUrl: data.imageUrl ?? '',
  };
}

export async function getCommunityCodePreview(code: string): Promise<CommunityCodePreview | null> {
  const normalizedCode = code.trim().toUpperCase();
  if (normalizedCode.length < 4) {
    return null;
  }

  const snapshot = await getDoc(communityCodeRef(normalizedCode));
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    communityId: data.communityId as string,
    communityCode: normalizedCode,
    name: (data.name as string) ?? 'Community',
    restrictions: normalizeCommunityRestrictions(data.restrictions),
    imageUrl: (data.imageUrl as string) ?? '',
  };
}

export async function createCommunity(input: {
  name: string;
  description: string;
  creatorDisplayName: string;
  restrictions: CommunityRestrictions;
  iconUri?: string | null;
}): Promise<{ communityId: string; communityCode: string }> {
  const userId = requireUserId();
  const name = input.name.trim();
  const description = input.description.trim();

  if (!name) {
    throw new Error('Community name is required.');
  }

  const communityId = doc(collection(db, 'communities')).id;
  const communityCode = generateCommunityCode();
  const now = serverTimestamp();
  const restrictions = input.restrictions ?? EMPTY_RESTRICTIONS;

  let imageUrl = '';
  if (input.iconUri) {
    imageUrl = await saveCommunityIconLocally(communityId, input.iconUri);
  }

  try {
    await setDoc(communityRef(communityId), {
      name,
      description,
      communityCode,
      createdBy: userId,
      memberCount: 1,
      restrictions,
      imageUrl,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    throw wrapCommunityError(error, 'Could not create the community record.');
  }

  try {
    await setDoc(communityCodeRef(communityCode), {
      communityId,
      communityCode,
      name,
      createdBy: userId,
      restrictions,
      imageUrl,
      createdAt: now,
    });
  } catch (error) {
    throw wrapCommunityError(error, 'Could not create the invite code.');
  }

  try {
    await setDoc(memberRef(communityId, userId), {
      userId,
      displayName: input.creatorDisplayName.trim() || 'Member',
      role: 'super_admin',
      status: 'active',
      joinedAt: now,
    });
  } catch (error) {
    throw wrapCommunityError(error, 'Could not add you as community admin.');
  }

  try {
    await setDoc(membershipRef(userId, communityId), {
      name,
      communityCode,
      role: 'super_admin',
      imageUrl,
      joinedAt: serverTimestamp(),
    });
  } catch (error) {
    throw wrapCommunityError(error, 'Could not save the community to your list.');
  }

  return { communityId, communityCode };
}

function wrapCommunityError(error: unknown, prefix: string): Error {
  const message = error instanceof Error ? error.message : 'Unknown error';
  if (message.toLowerCase().includes('permission') || message.includes('insufficient')) {
    return new Error(
      `${prefix} Firestore blocked the write. Deploy the latest firestore.rules to your Firebase project, then sign out and back in.`,
    );
  }

  return new Error(`${prefix} ${message}`);
}

export async function joinCommunityByCode(
  code: string,
  displayName: string,
  profile: UserProfile | null,
): Promise<string> {
  const userId = requireUserId();
  const normalizedCode = code.trim().toUpperCase();

  if (normalizedCode.length < 4) {
    throw new Error('Enter a valid community code.');
  }

  const codeSnapshot = await getDoc(communityCodeRef(normalizedCode));
  if (!codeSnapshot.exists()) {
    throw new Error('Community code not found.');
  }

  const codeData = codeSnapshot.data();
  const communityId = codeData.communityId as string;
  const communityName = (codeData.name as string) ?? 'Community';
  const restrictions = normalizeCommunityRestrictions(codeData.restrictions);
  const imageUrl = (codeData.imageUrl as string) ?? '';

  const eligibility = validateProfileForCommunity(profile, restrictions);
  if (!eligibility.allowed) {
    throw new Error(eligibility.message);
  }

  const existingMember = await getDoc(memberRef(communityId, userId));
  if (existingMember.exists()) {
    throw new Error('You are already a member of this community.');
  }

  const now = serverTimestamp();

  try {
    await setDoc(memberRef(communityId, userId), {
      userId,
      displayName: displayName.trim() || 'Member',
      role: 'member',
      status: 'active',
      joinedAt: now,
      joinedViaCode: normalizedCode,
    });
  } catch (error) {
    throw wrapCommunityError(error, 'Could not join as a member.');
  }

  try {
    await setDoc(membershipRef(userId, communityId), {
      name: communityName,
      communityCode: normalizedCode,
      role: 'member',
      imageUrl,
      joinedAt: now,
    });
  } catch (error) {
    throw wrapCommunityError(error, 'Could not add the community to your list.');
  }

  try {
    await updateDoc(communityRef(communityId), {
      memberCount: increment(1),
      updatedAt: now,
    });
  } catch (error) {
    throw wrapCommunityError(error, 'Could not update member count.');
  }

  return communityId;
}

export async function updateCommunityDetails(
  communityId: string,
  updates: { name?: string; description?: string },
): Promise<void> {
  const userId = requireUserId();
  const memberSnapshot = await getDoc(memberRef(communityId, userId));
  const role = memberSnapshot.data()?.role as CommunityRole | undefined;

  if (!memberSnapshot.exists() || !role || !['admin', 'super_admin'].includes(role)) {
    throw new Error('Only admins can edit community details.');
  }

  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (updates.name !== undefined) {
    payload.name = updates.name.trim();
  }

  if (updates.description !== undefined) {
    payload.description = updates.description.trim();
  }

  await updateDoc(communityRef(communityId), payload);

  if (updates.name !== undefined) {
    await updateDoc(membershipRef(userId, communityId), {
      name: updates.name.trim(),
    });
  }
}

export async function leaveCommunity(communityId: string): Promise<void> {
  const userId = requireUserId();
  const memberSnapshot = await getDoc(memberRef(communityId, userId));

  if (!memberSnapshot.exists()) {
    throw new Error('You are not a member of this community.');
  }

  const role = memberSnapshot.data()?.role as CommunityRole;
  if (role === 'super_admin') {
    throw new Error('Super admins cannot leave yet. Transfer ownership first.');
  }

  await deleteDoc(memberRef(communityId, userId));
  await deleteDoc(membershipRef(userId, communityId));
  await updateDoc(communityRef(communityId), {
    memberCount: increment(-1),
    updatedAt: serverTimestamp(),
  });
}
