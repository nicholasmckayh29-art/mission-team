import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore';

import * as ImagePicker from 'expo-image-picker';

import { auth, db } from '../config/firebase';
import { saveProfilePhotoLocally } from './profilePhoto';
import type { Gender, UserProfile } from '../types';

function usersRef(userId: string) {
  return doc(db, 'users', userId);
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(usersRef(userId));
  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as UserProfile;
}

export async function ensureUserProfile(user: {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
}): Promise<UserProfile> {
  const existing = await getUserProfile(user.uid);
  if (existing) {
    return existing;
  }

  const displayName = user.displayName?.trim() || 'Mission Team Member';
  const firstName = displayName.split(' ')[0] ?? displayName;

  const profile: Omit<UserProfile, 'createdAt' | 'updatedAt'> & {
    createdAt: ReturnType<typeof serverTimestamp>;
    updatedAt: ReturnType<typeof serverTimestamp>;
  } = {
    displayName,
    firstName,
    email: user.email ?? '',
    birthday: '',
    gender: '',
    photoURL: user.photoURL ?? '',
    onboardingComplete: false,
    accountStatus: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(usersRef(user.uid), profile);

  const created = await getUserProfile(user.uid);
  if (!created) {
    throw new Error('Failed to create user profile.');
  }

  return created;
}

export async function completeOnboarding(input: {
  firstName: string;
  birthday: string;
  gender: Gender;
  photoURL?: string;
}): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be signed in to complete onboarding.');
  }

  const displayName = input.firstName.trim();
  const payload = {
    firstName: displayName,
    displayName,
    birthday: input.birthday,
    gender: input.gender,
    photoURL: input.photoURL ?? user.photoURL ?? '',
    onboardingComplete: true,
    updatedAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
  };

  const userDoc = usersRef(user.uid);
  const existing = await getDoc(userDoc);

  if (existing.exists()) {
    await updateDoc(userDoc, payload);
    return;
  }

  await setDoc(userDoc, {
    email: user.email ?? '',
    accountStatus: 'active',
    createdAt: serverTimestamp(),
    ...payload,
  });
}

export async function touchLastActive(userId: string): Promise<void> {
  await updateDoc(usersRef(userId), {
    lastActiveAt: serverTimestamp(),
  });
}

export async function updateProfileName(input: {
  firstName: string;
  displayName?: string;
}): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be signed in to update your profile.');
  }

  const firstName = input.firstName.trim();
  if (!firstName) {
    throw new Error('First name is required.');
  }

  const displayName = (input.displayName ?? firstName).trim();

  await updateDoc(usersRef(user.uid), {
    firstName,
    displayName,
    updatedAt: serverTimestamp(),
  });
}

export async function uploadProfilePhoto(localUri: string): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be signed in to upload a photo.');
  }

  const photoURL = await saveProfilePhotoLocally(user.uid, localUri);

  await updateDoc(usersRef(user.uid), {
    photoURL,
    updatedAt: serverTimestamp(),
  });

  return photoURL;
}

export async function requestProfilePhotoPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

export async function pickProfilePhoto(): Promise<string | null> {
  const hasPermission = await requestProfilePhotoPermission();
  if (!hasPermission) {
    throw new Error('Photo library permission is required.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [1, 1],
    mediaTypes: ['images'],
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  return result.assets[0].uri;
}

export function isProfileComplete(profile: UserProfile | null): boolean {
  return Boolean(
    profile?.onboardingComplete &&
      profile.firstName &&
      profile.birthday &&
      profile.gender,
  );
}

export function formatBirthdayForDisplay(birthday: string): string {
  if (!birthday) {
    return '';
  }

  const [year, month, day] = birthday.split('-');
  if (!year || !month || !day) {
    return birthday;
  }

  return `${month}/${day}/${year}`;
}

export type { Timestamp };
