import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { Platform } from 'react-native';

import { auth } from '../config/firebase';
import { isExpoGo } from './googleAuth';

export function isNativeGoogleSignInAvailable(): boolean {
  return Platform.OS !== 'web' && !isExpoGo();
}

let configuredWebClientId = '';

export async function configureNativeGoogleSignIn(
  webClientId: string,
  iosClientId?: string,
): Promise<void> {
  if (!isNativeGoogleSignInAvailable() || !webClientId || configuredWebClientId === webClientId) {
    return;
  }

  const { GoogleSignin } = await import('@react-native-google-signin/google-signin');

  GoogleSignin.configure({
    webClientId,
    iosClientId: iosClientId || undefined,
    offlineAccess: false,
  });

  configuredWebClientId = webClientId;
}

export async function signInWithGoogleNative(
  webClientId: string,
  iosClientId?: string,
): Promise<void> {
  if (!isNativeGoogleSignInAvailable()) {
    throw new Error('Native Google Sign-In is not available in this build.');
  }

  const { GoogleSignin, isSuccessResponse } = await import(
    '@react-native-google-signin/google-signin'
  );

  await configureNativeGoogleSignIn(webClientId, iosClientId);
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) {
    return;
  }

  let idToken = response.data.idToken;
  if (!idToken) {
    const tokens = await GoogleSignin.getTokens();
    idToken = tokens.idToken;
  }

  if (!idToken) {
    throw new Error('Google sign-in did not return an ID token.');
  }

  const credential = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(auth, credential);
}

export async function signOutNativeGoogle(): Promise<void> {
  if (!isNativeGoogleSignInAvailable()) {
    return;
  }

  try {
    const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
    await GoogleSignin.signOut();
  } catch {
    // Ignore — Firebase sign-out still proceeds.
  }
}

export async function formatNativeGoogleSignInError(error: unknown): Promise<string> {
  if (!(error instanceof Error)) {
    return 'Google sign-in failed.';
  }

  try {
    const { isErrorWithCode, statusCodes } = await import(
      '@react-native-google-signin/google-signin'
    );

    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          return 'Sign-in was cancelled.';
        case statusCodes.IN_PROGRESS:
          return 'Sign-in already in progress.';
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          return 'Google Play Services is missing or outdated on this device.';
        default:
          break;
      }
    }
  } catch {
    // Fall through to generic message.
  }

  if (error.message.includes('DEVELOPER_ERROR')) {
    return 'Android OAuth is misconfigured. Add the EAS SHA-1 to your Android OAuth client in Google Cloud (see docs/android-build.md).';
  }

  return error.message;
}
