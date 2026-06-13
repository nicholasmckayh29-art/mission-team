import { Timestamp, serverTimestamp } from 'firebase/firestore';

import type { Contact, ContactInput, ContactStatus } from '../types';

export const FOLLOW_UP_INTERVAL_DAYS = 2;
export const MAX_STRIKES = 3;

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function computeNextReminderDate(from = new Date()): Date {
  return addDays(from, FOLLOW_UP_INTERVAL_DAYS);
}

export function buildNewContactFields(input: ContactInput) {
  const now = serverTimestamp();
  const nextReminderAt = Timestamp.fromDate(computeNextReminderDate());

  return {
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
    notes: input.notes.trim(),
    status: (input.status ?? 'follow_up') as ContactStatus,
    studyStatus: input.studyStatus ?? 'none',
    strikeCount: 0,
    lastInteractionAt: now,
    nextReminderAt,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildReminderUpdateFields(strikeCount: number) {
  return {
    nextReminderAt: Timestamp.fromDate(computeNextReminderDate()),
    updatedAt: serverTimestamp(),
    strikeCount,
  };
}

export function applyFollowUpContact(contact: Contact) {
  return {
    status: 'follow_up' as ContactStatus,
    strikeCount: 0,
    lastInteractionAt: serverTimestamp(),
    nextReminderAt: Timestamp.fromDate(computeNextReminderDate()),
    updatedAt: serverTimestamp(),
  };
}

export function applyMissedReminder(contact: Contact) {
  const nextStrikeCount = contact.strikeCount + 1;

  if (nextStrikeCount >= MAX_STRIKES) {
    return {
      status: 'forgotten' as ContactStatus,
      strikeCount: nextStrikeCount,
      nextReminderAt: null,
      updatedAt: serverTimestamp(),
    };
  }

  return {
    strikeCount: nextStrikeCount,
    nextReminderAt: Timestamp.fromDate(computeNextReminderDate()),
    updatedAt: serverTimestamp(),
  };
}
