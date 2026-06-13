import { StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
import { spacing, typography } from '../../theme';
import { homeColors } from '../../theme/home';

type EmptyStateProps = {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={styles.button} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  title: {
    ...typography.title,
    color: homeColors.ink,
    textAlign: 'center',
  },
  body: {
    ...typography.bodySmall,
    color: homeColors.muted,
    maxWidth: 320,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.sm,
    minWidth: 180,
  },
});
