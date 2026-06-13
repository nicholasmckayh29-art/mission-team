import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet } from 'react-native';

import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/providers/AuthProvider';
import { useWebFontsReady } from './src/shared/hooks/useWebFontsReady';
import { GradientView } from './src/shared/components/GradientView';
import { colors } from './src/theme';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    ...Ionicons.font,
  });
  const webFontsReady = useWebFontsReady(fontsLoaded);
  const appReady = Platform.OS === 'web' ? fontsLoaded && webFontsReady : fontsLoaded;

  useEffect(() => {
    if (appReady) {
      void SplashScreen.hideAsync();
    }
  }, [appReady]);

  useEffect(() => {
    if (fontError && __DEV__) {
      console.error('Font loading failed:', fontError);
    }
  }, [fontError]);

  if (!appReady) {
    return (
      <GradientView style={styles.loading} variant="background">
        <ActivityIndicator color={colors.primary} size="large" />
        <StatusBar style="dark" />
      </GradientView>
    );
  }

  return (
    <AuthProvider>
      <RootNavigator />
      <StatusBar style="dark" />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
