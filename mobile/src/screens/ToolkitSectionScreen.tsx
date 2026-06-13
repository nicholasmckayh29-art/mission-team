import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getToolkitSection } from '../content/toolkit';
import type { HomeStackParamList } from '../navigation/types';
import { AppCanvas } from '../shared/components/AppCanvas';
import { TabScreenHeader } from '../shared/components/TabScreenHeader';
import { ToolkitItemCard } from '../shared/components/ToolkitCard';
import { layout, spacing, typography } from '../theme';
import { homeColors } from '../theme/home';

type Props = NativeStackScreenProps<HomeStackParamList, 'ToolkitSection'>;

export function ToolkitSectionScreen({ route }: Props) {
  const section = getToolkitSection(route.params.sectionId);

  if (!section) {
    return (
      <AppCanvas style={styles.flex}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.missing}>This toolkit section could not be found.</Text>
        </SafeAreaView>
      </AppCanvas>
    );
  }

  return (
    <AppCanvas style={styles.flex}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <TabScreenHeader
            accent={section.accent}
            eyebrow={section.eyebrow}
            subtitle={section.summary}
            title={section.title}
          />

          <Text style={styles.sectionNote}>
            Placeholder slots below — swap in PDFs, images, and copy when your brothers send them.
          </Text>

          <View style={styles.list}>
            {section.items.map((item) => (
              <ToolkitItemCard
                accent={section.accent}
                key={item.id}
                placeholderNote={item.placeholderNote}
                softColor={section.softColor}
                status={item.status}
                summary={item.summary}
                title={item.title}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppCanvas>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    gap: spacing.md,
    maxWidth: layout.maxContentWidth,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    width: '100%',
  },
  sectionNote: {
    ...typography.bodySmall,
    color: homeColors.muted,
  },
  list: {
    gap: spacing.sm,
  },
  missing: {
    ...typography.body,
    color: homeColors.muted,
    padding: spacing.lg,
  },
});
