import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const WEB_PHOTO_PREFIX = 'local:web:';
const DEVICE_PHOTO_PREFIX = 'local:device:';

function webPhotoKey(userId: string) {
  return `@mission_team/profile_photo/${userId}`;
}

function devicePhotoPath(userId: string) {
  const baseDirectory = FileSystem.documentDirectory;
  if (!baseDirectory) {
    throw new Error('Local file storage is unavailable on this device.');
  }

  return `${baseDirectory}profile-${userId}.jpg`;
}

export function isLocalProfilePhotoMarker(photoURL: string | undefined): boolean {
  if (!photoURL) {
    return false;
  }

  return photoURL.startsWith(WEB_PHOTO_PREFIX) || photoURL.startsWith(DEVICE_PHOTO_PREFIX);
}

export function buildLocalProfilePhotoMarker(userId: string): string {
  return Platform.OS === 'web' ? `${WEB_PHOTO_PREFIX}${userId}` : `${DEVICE_PHOTO_PREFIX}${userId}`;
}

/** Saves a picked image on-device. No Firebase Storage or billing required. */
export async function saveProfilePhotoLocally(userId: string, pickedUri: string): Promise<string> {
  if (Platform.OS === 'web') {
    const response = await fetch(pickedUri);
    const blob = await response.blob();

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }

        reject(new Error('Could not read the selected image.'));
      };
      reader.onerror = () => reject(new Error('Could not read the selected image.'));
      reader.readAsDataURL(blob);
    });

    await AsyncStorage.setItem(webPhotoKey(userId), dataUrl);
    return buildLocalProfilePhotoMarker(userId);
  }

  const destination = devicePhotoPath(userId);
  await FileSystem.copyAsync({ from: pickedUri, to: destination });
  return buildLocalProfilePhotoMarker(userId);
}

export async function resolveProfilePhotoUri(
  photoURL: string | undefined,
  userId: string | undefined,
): Promise<string | null> {
  if (!photoURL) {
    return null;
  }

  if (
    photoURL.startsWith('http://') ||
    photoURL.startsWith('https://') ||
    photoURL.startsWith('file://') ||
    photoURL.startsWith('data:')
  ) {
    return photoURL;
  }

  if (!userId) {
    return null;
  }

  if (photoURL === `${WEB_PHOTO_PREFIX}${userId}`) {
    return AsyncStorage.getItem(webPhotoKey(userId));
  }

  if (photoURL === `${DEVICE_PHOTO_PREFIX}${userId}`) {
    const path = devicePhotoPath(userId);
    const info = await FileSystem.getInfoAsync(path);
    return info.exists ? path : null;
  }

  return photoURL;
}

export async function clearLocalProfilePhoto(userId: string): Promise<void> {
  await AsyncStorage.removeItem(webPhotoKey(userId));

  const path = devicePhotoPath(userId);
  const info = await FileSystem.getInfoAsync(path);
  if (info.exists) {
    await FileSystem.deleteAsync(path, { idempotent: true });
  }
}
