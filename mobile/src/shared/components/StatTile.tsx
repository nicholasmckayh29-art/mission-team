import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { cardShadow, colors, fonts, radius, spacing, typography } from '../../theme';
import { GradientView } from './GradientView';

type StatTileProps = {
  label: string;
  value: number;
  accentColor: string;
  accentSoft: string;
  style?: ViewStyle;
};

export function StatTile({ label, value, accentColor, accentSoft, style }: StatTileProps) {
  return (
    <View style={[styles.tile, { backgroundColor: accentSoft }, style]}>
      <GradientView
        colors={[accentColor, colors.primary]}
        end={{ x: 1, y: 0 }}
        start={{ x: 0, y: 0 }}
        style={styles.accentBar}
      />
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    minWidth: 100,
    overflow: 'hidden',
    padding: spacing.md,
    paddingTop: spacing.md + 4,
    ...cardShadow(),
  },
  accentBar: {
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    height: 3,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  value: {
    fontFamily: fonts.extraBold,
    fontSize: 28,
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    fontFamily: fonts.semibold,
    marginTop: 4,
  },
});
