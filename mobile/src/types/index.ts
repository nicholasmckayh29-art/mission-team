import type { Timestamp } from 'firebase/firestore';

export type ContactStatus = 'follow_up' | 'forgotten' | 'faithful' | 'backburner';
export type StudyStatus = 'none' | 'progressing' | 'paused' | 'stopped' | 'finished';
export type Gender = 'male' | 'female' | 'prefer_not_to_say';

export interface UserProfile {
  displayName: string;
  firstName: string;
  email: string;
  birthday: string;
  gender: Gender | '';
  photoURL?: string;
  onboardingComplete: boolean;
  accountStatus: 'active';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActiveAt?: Timestamp;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  status: ContactStatus;
  studyStatus: StudyStatus;
  strikeCount: number;
  lastInteractionAt?: Timestamp;
  nextReminderAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ContactInput = Pick<Contact, 'name' | 'phone' | 'email' | 'notes'> & {
  status?: ContactStatus;
  studyStatus?: StudyStatus;
};

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  follow_up: 'Follow up',
  forgotten: 'Forgotten',
  faithful: 'Faithful',
  backburner: 'Backburner',
};

export const STUDY_STATUS_LABELS: Record<StudyStatus, string> = {
  none: 'Awaiting first study',
  progressing: 'Studies in progress',
  paused: 'Studies paused',
  stopped: 'Studies abandoned',
  finished: 'Studies completed',
};

export const STUDY_STATUS_FILTER_LABELS: Record<'all' | StudyStatus, string> = {
  all: 'All disciples',
  none: 'Awaiting',
  progressing: 'In progress',
  paused: 'Paused',
  stopped: 'Abandoned',
  finished: 'Completed',
};

export type CommunityRole = 'member' | 'admin' | 'super_admin';
export type MemberStatus = 'active' | 'invited' | 'removed';

export interface CommunityRestrictions {
  gender: 'male' | 'female' | null;
  minimumAge: number | null;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  communityCode: string;
  createdBy: string;
  memberCount: number;
  restrictions: CommunityRestrictions;
  imageUrl: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CommunityCodePreview {
  communityId: string;
  communityCode: string;
  name: string;
  restrictions: CommunityRestrictions;
  imageUrl: string;
}

export interface CommunityMember {
  id: string;
  userId: string;
  displayName: string;
  role: CommunityRole;
  status: MemberStatus;
  joinedAt: Timestamp;
  joinedViaCode?: string;
}

export interface CommunityMembership {
  id: string;
  communityId: string;
  name: string;
  communityCode: string;
  role: CommunityRole;
  imageUrl: string;
  joinedAt: Timestamp;
}
