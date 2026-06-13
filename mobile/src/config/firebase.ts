import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

import { isExpoGo } from '../services/googleAuth';

type FirebaseExtraConfig = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
  googleWebClientId?: string;
  googleIosClientId?: string;
  googleAndroidClientId?: string;
};

function getFirebaseExtraConfig(): FirebaseExtraConfig {
  const fromExpoConfig = Constants.expoConfig?.extra?.firebase;
  if (fromExpoConfig && typeof fromExpoConfig === 'object') {
    return fromExpoConfig as FirebaseExtraConfig;
  }

  const fromManifest = Constants.manifest?.extra?.firebase;
  if (fromManifest && typeof fromManifest === 'object') {
    return fromManifest as FirebaseExtraConfig;
  }

  return {};
}

function getCoreFirebaseConfig() {
  const config = getFirebaseExtraConfig();

  return {
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
    measurementId: config.measurementId,
  };
}

const firebaseConfig = getCoreFirebaseConfig();

const missingKeys = ['apiKey', 'projectId', 'appId'].filter(
  (key) => !firebaseConfig[key as keyof typeof firebaseConfig],
);

if (missingKeys.length > 0) {
  console.warn(
    `Missing Firebase config values in app.json extra.firebase: ${missingKeys.join(', ')}`,
  );
}

export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const functions = getFunctions(firebaseApp);
export const storage = getStorage(firebaseApp);

export function getGoogleClientIds() {
  const config = getFirebaseExtraConfig();

  return {
    webClientId: config.googleWebClientId?.trim() ?? '',
    iosClientId: config.googleIosClientId?.trim() ?? '',
    androidClientId: config.googleAndroidClientId?.trim() ?? '',
  };
}

export function isGoogleAuthConfigured() {
  const { webClientId, androidClientId } = getGoogleClientIds();

  // Standalone native builds use @react-native-google-signin (web client ID + SHA-1).
  if (Platform.OS !== 'web' && !isExpoGo()) {
    return webClientId.length > 0;
  }

  if (Platform.OS === 'android' && isExpoGo()) {
    return webClientId.length > 0;
  }

  return webClientId.length > 0;
}
