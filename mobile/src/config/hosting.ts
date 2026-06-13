import Constants from 'expo-constants';

function getProjectId(): string {
  const firebase = Constants.expoConfig?.extra?.firebase;
  if (firebase && typeof firebase.projectId === 'string') {
    return firebase.projectId.trim();
  }

  return '';
}

/** Public web app URLs after Firebase Hosting deploy. */
export function getHostingUrls(): readonly string[] {
  const projectId = getProjectId();
  if (!projectId) {
    return [];
  }

  return [`https://${projectId}.web.app`, `https://${projectId}.firebaseapp.com`] as const;
}

export const HOSTING_URLS = getHostingUrls();
export const PRIMARY_HOSTING_URL = HOSTING_URLS[0] ?? '';
