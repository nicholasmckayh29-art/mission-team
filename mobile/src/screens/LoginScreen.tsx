import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { auth, getGoogleClientIds, isGoogleAuthConfigured } from '../config/firebase';
import {
  buildGoogleRedirectUri,
  formatFirebaseAuthError,
  formatGoogleAuthError,
  resolveGoogleClientIds,
} from '../services/googleAuth';
import {
  configureNativeGoogleSignIn,
  formatNativeGoogleSignInError,
  isNativeGoogleSignInAvailable,
  signInWithGoogleNative,
} from '../services/googleAuthNative';
import { signInWithGoogleOnWeb } from '../services/googleAuthWeb';
import { Button } from '../shared/components/Button';
import { AppCanvas } from '../shared/components/AppCanvas';
import { MissionTeamLogo } from '../shared/components/MissionTeamLogo';
import { colors, spacing, typography } from '../theme';

WebBrowser.maybeCompleteAuthSession();

export function LoginScreen() {
  if (Platform.OS === 'web') {
    return <LoginScreenWeb />;
  }

  return <LoginScreenNative />;
}

function LoginScreenWeb() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogleOnWeb();
    } catch (signInError) {
      setError(formatFirebaseAuthError(signInError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoginScreenLayout
      error={error}
      googleConfigured={isGoogleAuthConfigured()}
      loading={loading}
      onSignIn={handleGoogleSignIn}
      preparing={false}
    />
  );
}

function LoginScreenNative() {
  const { webClientId, iosClientId, androidClientId } = getGoogleClientIds();
  const googleClients = useMemo(
    () => resolveGoogleClientIds(webClientId, iosClientId, androidClientId),
    [webClientId, iosClientId, androidClientId],
  );

  if (isNativeGoogleSignInAvailable()) {
    return <LoginScreenNativeGoogleSdk webClientId={webClientId} iosClientId={iosClientId} />;
  }

  if (
    Platform.OS === 'android' &&
    !googleClients.usesWebFlowInExpoGo &&
    !googleClients.androidClientId
  ) {
    return (
      <LoginScreenNativeMissingConfig
        message="This APK was built without googleAndroidClientId. Rebuild with npm run build:android and reinstall."
      />
    );
  }

  return <LoginScreenNativeWithGoogle googleClients={googleClients} />;
}

function LoginScreenNativeGoogleSdk({
  webClientId,
  iosClientId,
}: {
  webClientId: string;
  iosClientId: string;
}) {
  const googleConfigured = webClientId.length > 0;
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (googleConfigured) {
      void configureNativeGoogleSignIn(webClientId, iosClientId || undefined);
    }
  }, [googleConfigured, webClientId, iosClientId]);

  async function handleGoogleSignIn() {
    setError('');

    if (!googleConfigured) {
      setError('Add googleWebClientId to app.json before signing in.');
      return;
    }

    setLoading(true);

    try {
      await signInWithGoogleNative(webClientId, iosClientId || undefined);
    } catch (signInError) {
      setError(await formatNativeGoogleSignInError(signInError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoginScreenLayout
      error={error}
      googleConfigured={googleConfigured}
      loading={loading}
      onSignIn={handleGoogleSignIn}
      preparing={false}
      signInDisabled={!googleConfigured || loading}
    />
  );
}

type LoginScreenNativeWithGoogleProps = {
  googleClients: ReturnType<typeof resolveGoogleClientIds>;
};

function LoginScreenNativeWithGoogle({ googleClients }: LoginScreenNativeWithGoogleProps) {
  const googleConfigured = isGoogleAuthConfigured();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectUri = useMemo(
    () => buildGoogleRedirectUri(googleClients.iosClientId, googleClients.usesWebFlowInExpoGo),
    [googleClients.iosClientId, googleClients.usesWebFlowInExpoGo],
  );

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: googleClients.webClientId,
    iosClientId: googleClients.iosClientId || undefined,
    androidClientId: googleClients.androidClientId || undefined,
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === 'error') {
      setError(formatGoogleAuthError(response.params));
      setLoading(false);
      return;
    }

    if (response?.type === 'cancel' || response?.type === 'dismiss') {
      setLoading(false);
      return;
    }

    async function completeSignIn() {
      if (response?.type !== 'success') {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const idToken =
          response.authentication?.idToken ??
          (typeof response.params?.id_token === 'string' ? response.params.id_token : null);

        if (!idToken) {
          throw new Error('Google sign-in did not return an ID token.');
        }

        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
      } catch (signInError) {
        const message =
          signInError instanceof Error ? signInError.message : 'Google sign-in failed.';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void completeSignIn();
  }, [response]);

  async function handleGoogleSignIn() {
    setError('');

    if (!isGoogleAuthConfigured()) {
      setError('Add googleWebClientId to app.json before signing in.');
      return;
    }

    if (Platform.OS === 'ios' && !googleClients.iosClientId) {
      setError('Add googleWebClientId to app.json for iPhone sign-in.');
      return;
    }

    if (Platform.OS === 'android' && !googleClients.androidClientId) {
      setError('Add googleAndroidClientId to app.json and rebuild the APK.');
      return;
    }

    setLoading(true);

    try {
      const result = await promptAsync();
      if (result.type === 'cancel' || result.type === 'dismiss') {
        setLoading(false);
      }
      if (result.type === 'error') {
        setError(formatGoogleAuthError(result.params));
        setLoading(false);
      }
    } catch (promptError) {
      const message =
        promptError instanceof Error ? promptError.message : 'Could not open Google sign-in.';
      setError(message);
      setLoading(false);
    }
  }

  return (
    <LoginScreenLayout
      debugLine={__DEV__ ? `Redirect URI: ${redirectUri}` : undefined}
      error={error}
      googleConfigured={googleConfigured}
      loading={loading}
      onSignIn={handleGoogleSignIn}
      preparing={googleConfigured && !request}
      signInDisabled={!googleConfigured || !request || loading}
    />
  );
}

function LoginScreenNativeMissingConfig({ message }: { message: string }) {
  return (
    <LoginScreenLayout
      error={message}
      googleConfigured={false}
      loading={false}
      onSignIn={() => undefined}
      preparing={false}
      signInDisabled
    />
  );
}

type LoginScreenLayoutProps = {
  debugLine?: string;
  error: string;
  googleConfigured: boolean;
  loading: boolean;
  onSignIn: () => void;
  preparing: boolean;
  signInDisabled?: boolean;
};

function LoginScreenLayout({
  debugLine,
  error,
  googleConfigured,
  loading,
  onSignIn,
  preparing,
  signInDisabled,
}: LoginScreenLayoutProps) {
  return (
    <AppCanvas style={styles.canvas}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <MissionTeamLogo />
          <View style={styles.actions}>
            <Button
              disabled={signInDisabled ?? (!googleConfigured || loading)}
              label="Continue with Google"
              loading={loading}
              onPress={onSignIn}
            />
            {!googleConfigured && __DEV__ ? (
              <Text style={styles.note}>Add googleWebClientId to mobile/app.json.</Text>
            ) : preparing ? (
              <Text style={styles.note}>Preparing Google sign-in...</Text>
            ) : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {debugLine ? <Text style={styles.debug}>{debugLine}</Text> : null}
          </View>
        </View>
      </SafeAreaView>
    </AppCanvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xl,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  actions: {
    gap: spacing.sm,
    maxWidth: 360,
    width: '100%',
  },
  note: {
    ...typography.caption,
    color: colors.textSubtle,
    textAlign: 'center',
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
  },
  debug: {
    ...typography.caption,
    color: colors.textSubtle,
    textAlign: 'center',
  },
});
