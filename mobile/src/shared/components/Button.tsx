import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { colors, fonts, radius, spacing, typography } from '../../theme';
import { homeColors } from '../../theme/home';

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const content = loading ? (
    <ActivityIndicator
      color={
        variant === 'primary' || variant === 'danger'
          ? homeColors.ink
          : homeColors.muted
      }
    />
  ) : (
    <Text
      style={[
        styles.label,
        variant === 'primary' && styles.primaryLabel,
        variant === 'secondary' && styles.secondaryLabel,
        variant === 'ghost' && styles.ghostLabel,
        variant === 'danger' && styles.dangerLabel,
      ]}
    >
      {label}
    </Text>
  );

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.lg,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  primary: {
    backgroundColor: homeColors.gold,
  },
  secondary: {
    backgroundColor: homeColors.tileWhite,
    borderColor: homeColors.goldDeep,
    borderWidth: 2,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.danger,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    ...typography.button,
    fontFamily: fonts.extraBold,
    letterSpacing: 0.3,
  },
  primaryLabel: {
    color: homeColors.ink,
  },
  secondaryLabel: {
    color: homeColors.ink,
  },
  ghostLabel: {
    color: homeColors.muted,
  },
  dangerLabel: {
    color: colors.white,
  },
});
