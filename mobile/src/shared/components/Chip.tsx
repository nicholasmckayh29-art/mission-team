import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { fonts, radius, spacing, typography } from '../../theme';
import { homeColors, tabAccentSoft } from '../../theme/home';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
  accent?: string;
};

export function Chip({ label, selected = false, onPress, style, accent = homeColors.gold }: ChipProps) {
  const softColor =
    accent === homeColors.tileYellow
      ? tabAccentSoft.contacts
      : accent === homeColors.tileGreen
        ? tabAccentSoft.studies
        : accent === homeColors.tileBlue
          ? tabAccentSoft.communities
          : tabAccentSoft.profile;

  if (selected) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.chipSelected,
          { backgroundColor: softColor, borderColor: accent },
          pressed && styles.chipPressed,
          style,
        ]}
      >
        <Text style={styles.labelSelected}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, pressed && styles.chipPressed, style]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: homeColors.tileWhite,
    borderColor: '#D5DEE8',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  chipSelected: {
    borderRadius: radius.pill,
    borderWidth: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  chipPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  label: {
    ...typography.caption,
    color: homeColors.muted,
    fontFamily: fonts.semibold,
  },
  labelSelected: {
    ...typography.caption,
    color: homeColors.ink,
    fontFamily: fonts.extraBold,
  },
});
