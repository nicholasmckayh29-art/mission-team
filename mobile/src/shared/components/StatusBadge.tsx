import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, fonts, radius, spacing, typography } from '../../theme';
import type { ContactStatus } from '../../types';
import { CONTACT_STATUS_LABELS } from '../../types';

type StatusBadgeProps = {
  status: ContactStatus;
  compact?: boolean;
  style?: ViewStyle;
};

export function StatusBadge({ status, compact = false, style }: StatusBadgeProps) {
  const softColor = colors.status[`${status}Soft` as keyof typeof colors.status] as string;
  const textColor = colors.status[status];

  return (
    <View style={[styles.base, compact && styles.compact, { backgroundColor: softColor }, style]}>
      <View style={[styles.dot, { backgroundColor: textColor }]} />
      <Text style={[styles.label, compact && styles.labelCompact, { color: textColor }]}>
        {CONTACT_STATUS_LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  compact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dot: {
    borderRadius: radius.pill,
    height: 8,
    width: 8,
  },
  label: {
    ...typography.caption,
    fontFamily: fonts.bold,
  },
  labelCompact: {
    fontSize: 12,
  },
});
