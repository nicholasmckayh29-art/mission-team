import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';

import { auth, db } from '../config/firebase';
import type { Contact, ContactInput, ContactStatus, StudyStatus } from '../types';
import {
  applyFollowUpContact,
  applyMissedReminder,
  buildNewContactFields,
  buildReminderUpdateFields,
} from './contactReminders';
import { normalizePhone } from './deviceContacts';
import { scheduleLocalFollowUpReminder } from './notifications';

function contactsCollection(userId: string) {
  return collection(db, 'users', userId, 'contacts');
}

function contactRef(userId: string, contactId: string) {
  return doc(db, 'users', userId, 'contacts', contactId);
}

function requireUserId(): string {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('You must be signed in to manage contacts.');
  }

  return userId;
}

export function subscribeContacts(onChange: (contacts: Contact[]) => void): Unsubscribe {
  const userId = requireUserId();
  const contactsQuery = query(contactsCollection(userId), orderBy('updatedAt', 'desc'));

  return onSnapshot(contactsQuery, (snapshot) => {
    const contacts = snapshot.docs.map((document) => ({
      id: document.id,
      ...(document.data() as Omit<Contact, 'id'>),
    }));

    onChange(contacts);
  });
}

export async function createContact(input: ContactInput): Promise<string> {
  const userId = requireUserId();
  const payload = buildNewContactFields(input);

  const created = await addDoc(contactsCollection(userId), payload);

  if (payload.nextReminderAt) {
    await scheduleLocalFollowUpReminder(input.name.trim(), payload.nextReminderAt.toDate());
  }

  return created.id;
}

export async function createContactsBulk(
  inputs: ContactInput[],
): Promise<{ imported: number; skipped: number }> {
  const userId = requireUserId();
  const snapshot = await getDocs(contactsCollection(userId));
  const existingPhones = new Set<string>();
  const existingEmails = new Set<string>();

  snapshot.docs.forEach((document) => {
    const data = document.data() as Contact;
    const phone = normalizePhone(data.phone ?? '');
    if (phone) {
      existingPhones.add(phone);
    }

    const email = data.email?.trim().toLowerCase() ?? '';
    if (email) {
      existingEmails.add(email);
    }
  });

  let imported = 0;
  let skipped = 0;
  let batch = writeBatch(db);
  let batchCount = 0;

  for (const input of inputs) {
    const name = input.name.trim();
    if (!name) {
      skipped += 1;
      continue;
    }

    const phone = normalizePhone(input.phone ?? '');
    const email = input.email?.trim().toLowerCase() ?? '';

    if ((phone && existingPhones.has(phone)) || (email && existingEmails.has(email))) {
      skipped += 1;
      continue;
    }

    const ref = doc(contactsCollection(userId));
    batch.set(ref, buildNewContactFields(input));
    batchCount += 1;
    imported += 1;

    if (phone) {
      existingPhones.add(phone);
    }

    if (email) {
      existingEmails.add(email);
    }

    if (batchCount >= 400) {
      await batch.commit();
      batch = writeBatch(db);
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  return { imported, skipped };
}

export async function updateContact(
  contactId: string,
  updates: Partial<
    Pick<
      Contact,
      'name' | 'phone' | 'email' | 'notes' | 'status' | 'studyStatus' | 'strikeCount'
    >
  >,
): Promise<void> {
  const userId = requireUserId();

  await updateDoc(contactRef(userId, contactId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteContact(contactId: string): Promise<void> {
  const userId = requireUserId();
  await deleteDoc(contactRef(userId, contactId));
}

export async function markContactFollowedUp(contact: Contact): Promise<void> {
  const userId = requireUserId();
  const updates = applyFollowUpContact(contact);

  await updateDoc(contactRef(userId, contact.id), updates);

  if (updates.nextReminderAt) {
    await scheduleLocalFollowUpReminder(contact.name, updates.nextReminderAt.toDate());
  }
}

export async function setStudyStatus(contact: Contact, studyStatus: StudyStatus): Promise<void> {
  const userId = requireUserId();

  await updateDoc(contactRef(userId, contact.id), {
    studyStatus,
    updatedAt: serverTimestamp(),
  });
}

export async function setContactStatus(
  contact: Contact,
  status: ContactStatus,
  studyStatus?: StudyStatus,
): Promise<void> {
  const userId = requireUserId();

  await updateDoc(contactRef(userId, contact.id), {
    status,
    studyStatus: studyStatus ?? contact.studyStatus,
    updatedAt: serverTimestamp(),
    ...(status === 'faithful' ? { studyStatus: studyStatus ?? 'progressing' } : {}),
  });
}

export async function processOverdueReminders(contacts: Contact[]): Promise<void> {
  const userId = requireUserId();
  const now = Date.now();

  for (const contact of contacts) {
    if (contact.status !== 'follow_up' || !contact.nextReminderAt) {
      continue;
    }

    if (contact.nextReminderAt.toMillis() > now) {
      continue;
    }

    const updates = applyMissedReminder(contact);
    await updateDoc(contactRef(userId, contact.id), updates);

    if ('nextReminderAt' in updates && updates.nextReminderAt) {
      await scheduleLocalFollowUpReminder(contact.name, updates.nextReminderAt.toDate());
    }
  }
}

export async function rescheduleContactReminder(contact: Contact): Promise<void> {
  const userId = requireUserId();
  const updates = buildReminderUpdateFields(contact.strikeCount);

  await updateDoc(contactRef(userId, contact.id), updates);

  if (updates.nextReminderAt) {
    await scheduleLocalFollowUpReminder(contact.name, updates.nextReminderAt.toDate());
  }
}
