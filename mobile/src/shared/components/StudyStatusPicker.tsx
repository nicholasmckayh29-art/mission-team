import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { getStudyStatusColors, ACTIONABLE_STUDY_STATUSES } from '../../theme/studyStatus';
import { colors, fonts, radius, spacing, typography } from '../../theme';
import type { StudyStatus } from '../../types';
import { STUDY_STATUS_LABELS } from '../../types';

type StudyStatusPickerProps = {
  selected: StudyStatus;
  onSelect: (status: StudyStatus) => void;
  loadingStatus?: StudyStatus | null;
  compact?: boolean;
};

export function StudyStatusPicker({
  selected,
  onSelect,
  loadingStatus = null,
  compact = false,
}: StudyStatusPickerProps) {
  return (
    <View style={[styles.grid, compact && styles.gridCompact]}>
      {ACTIONABLE_STUDY_STATUSES.map((status) => {
        const palette = getStudyStatusColors(status);
        const isSelected = selected === status;
        const isLoading = loadingStatus === status;

        return (
          <Pressable
            key={status}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            disabled={Boolean(loadingStatus)}
            onPress={() => onSelect(status)}
            style={({ pressed }) => [
              styles.option,
              compact && styles.optionCompact,
              {
                backgroundColor: isSelected ? palette.soft : colors.surface,
                borderColor: isSelected ? palette.solid : colors.border,
              },
              pressed && styles.optionPressed,
            ]}
          >
            <View style={[styles.swatch, { backgroundColor: palette.solid }]} />
            {isLoading ? (
              <ActivityIndicator color={palette.text} size="small" />
            ) : (
              <Text
                numberOfLines={2}
                style={[
                  styles.label,
                  compact && styles.labelCompact,
                  { color: isSelected ? palette.text : colors.textMuted },
                ]}
              >
                {STUDY_STATUS_LABELS[status]}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: spacing.sm,
  },
  gridCompact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionCompact: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  optionPressed: {
    opacity: 0.92,
    transform: [{ translateY: 1 }],
  },
  swatch: {
    borderRadius: radius.pill,
    height: 10,
    width: 10,
  },
  label: {
    ...typography.bodySmall,
    flex: 1,
    fontFamily: fonts.semibold,
  },
  labelCompact: {
    fontSize: 13,
  },
});
