import { StyleSheet, Text, View } from 'react-native';

import { fonts, spacing, typography } from '../../theme';
import { homeColors } from '../../theme/home';

type TabScreenHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  accent: string;
};

export function TabScreenHeader({ eyebrow, title, subtitle, accent }: TabScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={[styles.eyebrow, { color: accent }]}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  eyebrow: {
    ...typography.eyebrow,
    fontFamily: fonts.extraBold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.hero,
    color: homeColors.ink,
    marginTop: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: homeColors.muted,
    marginTop: spacing.sm,
  },
});
