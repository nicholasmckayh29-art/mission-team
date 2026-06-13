import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TOOLKIT_INTRO, TOOLKIT_SECTIONS } from '../content/toolkit';
import type { HomeStackParamList } from '../navigation/types';
import { AppCanvas } from '../shared/components/AppCanvas';
import { TabScreenHeader } from '../shared/components/TabScreenHeader';
import { ToolkitSectionCard } from '../shared/components/ToolkitCard';
import { layout, spacing } from '../theme';
import { tabAccents } from '../theme/home';

type Props = NativeStackScreenProps<HomeStackParamList, 'Toolkit'>;

const ACCENT = tabAccents.profile;

export function ToolkitScreen({ navigation }: Props) {
  return (
    <AppCanvas style={styles.flex}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <TabScreenHeader
            accent={ACCENT}
            eyebrow="My toolkit"
            subtitle={TOOLKIT_INTRO}
            title="Outreach resources"
          />

          <View style={styles.list}>
            {TOOLKIT_SECTIONS.map((section) => (
              <ToolkitSectionCard
                key={section.id}
                onPress={() => navigation.navigate('ToolkitSection', { sectionId: section.id })}
                section={section}
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
    gap: spacing.lg,
    maxWidth: layout.maxContentWidth,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    width: '100%',
  },
  list: {
    gap: spacing.sm,
  },
});
