import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { cardShadow, radius, spacing, typography } from '../../theme';
import { homeColors } from '../../theme/home';

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  title?: string;
  subtitle?: string;
};

export function Card({ children, style, title, subtitle }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: homeColors.tileWhite,
    borderColor: '#D5DEE8',
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
    ...cardShadow(),
  },
  title: {
    ...typography.title,
    color: homeColors.ink,
  },
  subtitle: {
    ...typography.bodySmall,
    color: homeColors.muted,
  },
});
