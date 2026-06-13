import Constants, { ExecutionEnvironment } from 'expo-constants';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';

export function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

export function toReversedGoogleClientId(clientId: string): string {
  const idPart = clientId.replace('.apps.googleusercontent.com', '');
  return `com.googleusercontent.apps.${idPart}`;
}

export function resolveGoogleClientIds(
  webClientId: string,
  iosClientId: string,
  androidClientId = '',
) {
  // Expo Go cannot use platform-specific OAuth clients — fall back to the Web client.
  if (Platform.OS === 'ios' && isExpoGo()) {
    return {
      webClientId,
      iosClientId: webClientId,
      androidClientId: '',
      usesWebFlowInExpoGo: true,
    };
  }

  if (Platform.OS === 'android' && isExpoGo()) {
    return {
      webClientId,
      iosClientId,
      androidClientId: webClientId,
      usesWebFlowInExpoGo: true,
    };
  }

  return {
    webClientId,
    iosClientId,
    androidClientId,
    usesWebFlowInExpoGo: false,
  };
}

export function buildGoogleRedirectUri(iosClientId: string, usesWebFlowInExpoGo = false): string {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      const { hostname, origin } = window.location;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return origin;
      }
    }

    return makeRedirectUri({
      preferLocalhost: true,
    });
  }

  if (Platform.OS === 'ios' && iosClientId && !usesWebFlowInExpoGo) {
    return makeRedirectUri({
      native: `${toReversedGoogleClientId(iosClientId)}:/oauthredirect`,
      scheme: 'missionteam',
    });
  }

  return makeRedirectUri({
    scheme: 'missionteam',
  });
}

export function formatGoogleAuthError(params: Record<string, string | undefined>): string {
  const error = params.error ?? 'auth_error';
  const description = params.error_description ?? params.error_uri;

  if (error === 'redirect_uri_mismatch') {
    return 'Google redirect URI mismatch. On hosted web, redeploy the latest app build. For local dev, add the redirect URI shown below to your Web OAuth client.';
  }

  if (error === 'access_denied') {
    return 'Sign-in was cancelled or your account is not allowed yet. Add your Gmail as a test user in Google Cloud OAuth consent screen.';
  }

  if (error === 'invalid_client' || description?.includes('DEVELOPER_ERROR')) {
    return 'Android OAuth is misconfigured. In Google Cloud, open your Android OAuth client for org.missionteam.app and add the EAS keystore SHA-1 (see docs/android-build.md). No rebuild needed after fixing.';
  }

  if (description) {
    return `${error}: ${description}`;
  }

  return `Google returned ${error}. Add your Gmail as a test user, and add the redirect URI shown below to your Web OAuth client.`;
}

export function formatFirebaseAuthError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Google sign-in failed.';
  }

  const code = (error as { code?: string }).code ?? '';

  if (code === 'auth/popup-closed-by-user') {
    return 'Sign-in was cancelled.';
  }

  if (code === 'auth/popup-blocked') {
    return 'Sign-in popup was blocked. Allow popups for this site and try again.';
  }

  if (code === 'auth/unauthorized-domain') {
    return 'This domain is not authorized in Firebase Authentication. Add your hosting domain under Authentication → Settings → Authorized domains.';
  }

  return error.message;
}
