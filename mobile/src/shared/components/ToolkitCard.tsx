import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ToolkitSection } from '../../content/toolkit';
import { countToolkitItems } from '../../content/toolkit';
import { fonts, radius, spacing, typography } from '../../theme';
import { homeColors } from '../../theme/home';

type ToolkitSectionCardProps = {
  section: ToolkitSection;
  onPress: () => void;
};

export function ToolkitSectionCard({ section, onPress }: ToolkitSectionCardProps) {
  const { total, ready } = countToolkitItems(section);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: section.softColor }, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, { backgroundColor: section.accent }]}>
        <Ionicons color={homeColors.ink} name={section.icon} size={24} />
      </View>
      <View style={styles.body}>
        <Text style={[styles.eyebrow, { color: section.accent }]}>{section.eyebrow}</Text>
        <Text style={styles.title}>{section.title}</Text>
        <Text style={styles.summary}>{section.summary}</Text>
        <Text style={styles.meta}>
          {ready > 0 ? `${ready} of ${total} ready` : `${total} slots · content coming soon`}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

type ToolkitItemCardProps = {
  title: string;
  summary: string;
  status: 'coming_soon' | 'ready';
  placeholderNote: string;
  accent: string;
  softColor: string;
};

export function ToolkitItemCard({
  title,
  summary,
  status,
  placeholderNote,
  accent,
  softColor,
}: ToolkitItemCardProps) {
  return (
    <View style={[styles.itemCard, { borderColor: accent }]}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{title}</Text>
        <View style={[styles.badge, { backgroundColor: softColor }]}>
          <Text style={[styles.badgeLabel, { color: homeColors.ink }]}>
            {status === 'ready' ? 'Ready' : 'Coming soon'}
          </Text>
        </View>
      </View>
      <Text style={styles.itemSummary}>{summary}</Text>
      {status === 'coming_soon' ? (
        <Text style={styles.placeholder}>{placeholderNote}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    fontFamily: fonts.extraBold,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.title,
    color: homeColors.ink,
    fontSize: 18,
  },
  summary: {
    ...typography.bodySmall,
    color: homeColors.muted,
  },
  meta: {
    ...typography.caption,
    color: homeColors.muted,
    fontFamily: fonts.semibold,
    marginTop: 2,
  },
  chevron: {
    ...typography.title,
    color: homeColors.muted,
  },
  itemCard: {
    backgroundColor: homeColors.tileWhite,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  itemHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  itemTitle: {
    ...typography.title,
    color: homeColors.ink,
    flex: 1,
    fontSize: 17,
  },
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  itemSummary: {
    ...typography.bodySmall,
    color: homeColors.muted,
  },
  placeholder: {
    ...typography.caption,
    color: homeColors.muted,
    fontFamily: fonts.semibold,
    fontStyle: 'italic',
  },
});
