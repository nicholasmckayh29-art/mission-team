import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { getStudyStatusColors } from '../../theme/studyStatus';
import { fonts, radius, spacing, typography } from '../../theme';
import type { StudyStatus } from '../../types';
import { STUDY_STATUS_LABELS } from '../../types';

type StudyBadgeProps = {
  status: StudyStatus;
  compact?: boolean;
  style?: ViewStyle;
};

export function StudyBadge({ status, compact = false, style }: StudyBadgeProps) {
  const palette = getStudyStatusColors(status);

  return (
    <View
      style={[
        styles.base,
        compact && styles.compact,
        { backgroundColor: palette.soft, borderColor: palette.solid },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: palette.solid }]} />
      <Text style={[styles.label, compact && styles.labelCompact, { color: palette.text }]}>
        {STUDY_STATUS_LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
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
    fontSize: 11,
  },
});
