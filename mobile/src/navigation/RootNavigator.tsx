import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { useAuth } from '../providers/AuthProvider';
import { LoginScreen } from '../screens/LoginScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { AppCanvas } from '../shared/components/AppCanvas';
import { colors } from '../theme';
import { homeColors } from '../theme/home';
import { MainTabNavigator } from './MainTabNavigator';
import type { RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

const appNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    border: colors.border,
    card: colors.surface,
    primary: colors.primary,
    text: colors.text,
  },
};

function LoadingScreen() {
  return (
    <AppCanvas style={styles.loading}>
      <ActivityIndicator color={homeColors.goldDeep} size="large" />
    </AppCanvas>
  );
}

export function RootNavigator() {
  const { loading, user, profileComplete } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer key={user ? 'signed-in' : 'signed-out'} theme={appNavigationTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <RootStack.Screen component={LoginScreen} name="Login" />
        ) : !profileComplete ? (
          <RootStack.Screen component={OnboardingScreen} name="Onboarding" />
        ) : (
          <RootStack.Screen component={MainTabNavigator} name="Main" />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
