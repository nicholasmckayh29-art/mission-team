import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export const COMMUNITY_ICON_PREFIX = 'local:community:';

function webIconKey(communityId: string) {
  return `@mission_team/community_icon/${communityId}`;
}

function deviceIconPath(communityId: string) {
  const baseDirectory = FileSystem.documentDirectory;
  if (!baseDirectory) {
    throw new Error('Local file storage is unavailable on this device.');
  }

  return `${baseDirectory}community-icon-${communityId}.jpg`;
}

export function buildCommunityIconMarker(communityId: string): string {
  return `${COMMUNITY_ICON_PREFIX}${communityId}`;
}

export function isCommunityIconMarker(imageUrl: string | undefined): boolean {
  return Boolean(imageUrl?.startsWith(COMMUNITY_ICON_PREFIX));
}

export async function pickCommunityIcon(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Photo library permission is required for a group icon.');
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

export async function saveCommunityIconLocally(
  communityId: string,
  pickedUri: string,
): Promise<string> {
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

    await AsyncStorage.setItem(webIconKey(communityId), dataUrl);
    return buildCommunityIconMarker(communityId);
  }

  await FileSystem.copyAsync({
    from: pickedUri,
    to: deviceIconPath(communityId),
  });

  return buildCommunityIconMarker(communityId);
}

export async function resolveCommunityIconUri(
  imageUrl: string | undefined,
  communityId: string | undefined,
): Promise<string | null> {
  if (!imageUrl || !communityId) {
    return null;
  }

  if (
    imageUrl.startsWith('http://') ||
    imageUrl.startsWith('https://') ||
    imageUrl.startsWith('file://') ||
    imageUrl.startsWith('data:')
  ) {
    return imageUrl;
  }

  if (imageUrl !== buildCommunityIconMarker(communityId)) {
    return null;
  }

  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(webIconKey(communityId));
  }

  const path = deviceIconPath(communityId);
  const info = await FileSystem.getInfoAsync(path);
  return info.exists ? path : null;
}
