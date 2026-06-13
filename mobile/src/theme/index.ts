import { Platform, type TextStyle, type ViewStyle } from 'react-native';

import { homeColors, tabAccentSoft } from './home';

/** Geometric grotesque similar in spirit to Instagram Sans (custom / not licensed). */
export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
};

/** Classic Instagram brand gradient stops. */
export const gradients = {
  brand: ['#833AB4', '#C13584', '#E1306C', '#F56040', '#FCAF45'],
  brandSoft: ['#f3e8ff', '#fde8f0', '#fff0e6'],
  background: ['#fafafa', '#fef8fc', '#fff9f4'],
  backgroundAlt: ['#f5f5f5', '#fdf5f9', '#fff8f2'],
} as const;

export const colors = {
  background: homeColors.canvas,
  backgroundAlt: '#E4ECF3',
  surface: homeColors.tileWhite,
  surfaceMuted: '#F4F7FA',
  /** Primary action color — home gold CTA. */
  primary: homeColors.gold,
  primaryMuted: homeColors.goldDeep,
  primarySoft: tabAccentSoft.profile,
  text: homeColors.ink,
  textMuted: homeColors.muted,
  textSubtle: '#8A939C',
  border: '#D5DEE8',
  borderStrong: homeColors.goldDeep,
  danger: '#ED4956',
  dangerSoft: '#fde8ea',
  white: '#ffffff',
  status: {
    follow_up: '#F77737',
    follow_upSoft: '#fff0e6',
    forgotten: '#FD1D1D',
    forgottenSoft: '#fde8e8',
    faithful: '#833AB4',
    faithfulSoft: '#f3e8ff',
    backburner: '#737373',
    backburnerSoft: '#f0f0f0',
  },
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

/** Slightly rounder corners — squircle-adjacent without custom shapes. */
export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  pill: 999,
};

export const typography = {
  eyebrow: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 0.2,
  } satisfies TextStyle,
  hero: {
    fontFamily: fonts.bold,
    fontSize: 26,
    letterSpacing: -0.6,
    lineHeight: 32,
  } satisfies TextStyle,
  title: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    letterSpacing: -0.3,
    lineHeight: 22,
  } satisfies TextStyle,
  body: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  } satisfies TextStyle,
  bodySmall: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  } satisfies TextStyle,
  caption: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  } satisfies TextStyle,
  button: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    letterSpacing: -0.1,
  } satisfies TextStyle,
};

export const layout = {
  maxContentWidth: 560,
  tabBarHeight: 64,
};

export function cardShadow(): ViewStyle {
  if (Platform.OS === 'web') {
    return {
      boxShadow: '0 1px 2px rgba(38, 38, 38, 0.06)',
    } as ViewStyle;
  }

  return {
    shadowColor: '#262626',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  };
}

export const navigationTheme = {
  tabActive: homeColors.ink,
  tabInactive: homeColors.muted,
  headerBackground: homeColors.canvas,
};
