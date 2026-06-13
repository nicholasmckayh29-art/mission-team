import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { CommunitiesStackParamList } from '../navigation/types';
import { AppCanvas } from '../shared/components/AppCanvas';
import { Button } from '../shared/components/Button';
import { Card } from '../shared/components/Card';
import { CommunityAvatar } from '../shared/components/CommunityAvatar';
import { EmptyState } from '../shared/components/EmptyState';
import { TabScreenHeader } from '../shared/components/TabScreenHeader';
import { useCommunities } from '../shared/hooks/useCommunities';
import { colors, fonts, layout, radius, spacing, typography } from '../theme';
import { homeColors, tabAccents } from '../theme/home';

type Props = NativeStackScreenProps<CommunitiesStackParamList, 'Communities'>;

const ACCENT = tabAccents.communities;

const SETUP_STEPS = [
  'Confirm you are signed in (Home → profile photo).',
  'On your computer, open the MISSION_TEAM folder in Terminal.',
  'Run: npx firebase-tools login (if you have not already).',
  'Run: npx firebase-tools deploy --only firestore:rules',
  'Reload the app, sign out, then sign back in with Google.',
  'Open Communities → Create community, enter a name, and submit.',
];

export function CommunitiesScreen({ navigation }: Props) {
  const { memberships, loading, error } = useCommunities();

  return (
    <AppCanvas style={styles.flex}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <TabScreenHeader
            accent={ACCENT}
            eyebrow="Communities"
            subtitle="Create a community or join with an invite code."
            title="Your communities"
          />

          <View style={styles.actions}>
            <Button label="Create community" onPress={() => navigation.navigate('CommunityForm')} />
            <Button
              label="Join with code"
              onPress={() => navigation.navigate('JoinCommunity')}
              variant="secondary"
            />
          </View>

          {error ? (
            <Card style={styles.helpCard} title="Fix permissions">
              <Text style={styles.helpIntro}>
                Firestore blocked community access. Work through these steps in order:
              </Text>
              {SETUP_STEPS.map((step, index) => (
                <Text key={step} style={styles.helpStep}>
                  {index + 1}. {step}
                </Text>
              ))}
              <Text style={styles.errorBanner}>{error}</Text>
            </Card>
          ) : null}

          <FlatList
            contentContainerStyle={styles.listContent}
            data={memberships}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              !loading ? (
                <EmptyState
                  actionLabel="Create community"
                  body="Communities help your ministry team coordinate outreach together."
                  onAction={() => navigation.navigate('CommunityForm')}
                  title="No communities yet"
                />
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  navigation.navigate('CommunityDetail', { communityId: item.communityId })
                }
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              >
                <CommunityAvatar
                  communityId={item.communityId}
                  imageUrl={item.imageUrl}
                  name={item.name}
                  size={48}
                />
                <View style={styles.rowBody}>
                  <Text numberOfLines={1} style={styles.name}>
                    {item.name}
                  </Text>
                  <Text style={styles.meta}>
                    Code {item.communityCode} · {item.role.replace('_', ' ')}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
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
  container: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: layout.maxContentWidth,
    width: '100%',
  },
  actions: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  helpCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  helpIntro: {
    ...typography.bodySmall,
    color: homeColors.muted,
  },
  helpStep: {
    ...typography.caption,
    color: homeColors.ink,
    fontFamily: fonts.semibold,
    lineHeight: 18,
  },
  errorBanner: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.sm,
  },
  listContent: {
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  row: {
    alignItems: 'center',
    backgroundColor: homeColors.tileWhite,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  rowPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  name: {
    ...typography.title,
    color: homeColors.ink,
    fontSize: 18,
  },
  meta: {
    ...typography.caption,
    color: homeColors.muted,
    fontFamily: fonts.semibold,
    textTransform: 'capitalize',
  },
  chevron: {
    ...typography.title,
    color: homeColors.muted,
  },
});
