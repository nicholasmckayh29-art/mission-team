import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import type { CommunitiesStackParamList } from '../navigation/types';
import { useAuth } from '../providers/AuthProvider';
import {
  getCommunity,
  leaveCommunity,
  subscribeCommunityMembers,
  updateCommunityDetails,
} from '../services/communities';
import { Button } from '../shared/components/Button';
import { Card } from '../shared/components/Card';
import { CommunityAvatar } from '../shared/components/CommunityAvatar';
import { Screen, TextField } from '../shared/components/Screen';
import { formatRestrictionsSummary } from '../utils/communityRestrictions';
import { colors, fonts, spacing, typography } from '../theme';
import { homeColors, tabAccents } from '../theme/home';
import type { Community, CommunityMember } from '../types';

type Props = NativeStackScreenProps<CommunitiesStackParamList, 'CommunityDetail'>;

export function CommunityDetailScreen({ navigation, route }: Props) {
  const { communityId } = route.params;
  const { user } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState('');

  const currentMember = members.find((member) => member.userId === user?.uid);
  const canEdit = currentMember?.role === 'admin' || currentMember?.role === 'super_admin';

  useEffect(() => {
    void getCommunity(communityId).then((nextCommunity) => {
      if (nextCommunity) {
        setCommunity(nextCommunity);
        setName(nextCommunity.name);
        setDescription(nextCommunity.description);
      }
    });
  }, [communityId]);

  useEffect(() => {
    const unsubscribe = subscribeCommunityMembers(communityId, setMembers);
    return unsubscribe;
  }, [communityId]);

  async function runAction(actionKey: string, action: () => Promise<void>) {
    setLoadingAction(actionKey);
    setError('');

    try {
      await action();
    } catch (actionError) {
      const message = actionError instanceof Error ? actionError.message : 'Action failed.';
      setError(message);
    } finally {
      setLoadingAction(null);
    }
  }

  function confirmLeave() {
    Alert.alert('Leave community', 'You will lose access to this community.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => {
          void runAction('leave', async () => {
            await leaveCommunity(communityId);
            navigation.goBack();
          });
        },
      },
    ]);
  }

  if (!community) {
    return (
      <Screen accent={tabAccents.communities} showBrand={false} subtitle="Loading community..." title="Community">
        <Text style={styles.loading}>Loading...</Text>
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      accent={tabAccents.communities}
      showBrand={false}
      subtitle={`${community.memberCount} members · code ${community.communityCode}`}
      title={community.name}
      footer={
        <>
          {canEdit ? (
            <Button
              label="Save changes"
              loading={loadingAction === 'save'}
              onPress={() =>
                runAction('save', () => updateCommunityDetails(communityId, { name, description }))
              }
            />
          ) : null}
          {currentMember?.role === 'member' ? (
            <Button
              label="Leave community"
              loading={loadingAction === 'leave'}
              onPress={confirmLeave}
              variant="danger"
            />
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </>
      }
    >
      <View style={styles.hero}>
        <CommunityAvatar
          communityId={community.id}
          imageUrl={community.imageUrl}
          name={community.name}
          size={88}
        />
        <Text style={styles.restrictions}>
          {formatRestrictionsSummary(community.restrictions)}
        </Text>
      </View>

      {canEdit ? (
        <Card title="Community details">
          <TextField label="Name" onChangeText={setName} value={name} />
          <TextField
            label="Description"
            multiline
            numberOfLines={4}
            onChangeText={setDescription}
            style={styles.textArea}
            value={description}
          />
        </Card>
      ) : (
        <Card title="About">
          <Text style={styles.body}>
            {community.description.trim() || 'No description yet.'}
          </Text>
        </Card>
      )}

      <Card title="Invite code">
        <Text style={styles.code}>{community.communityCode}</Text>
        <Text style={styles.hint}>Share this code so others can join from the Communities tab.</Text>
      </Card>

      <Card title="Members">
        {members.map((item) => (
          <View key={item.id} style={styles.memberRow}>
            <View style={styles.memberBody}>
              <Text style={styles.memberName}>{item.displayName}</Text>
              <Text style={styles.memberMeta}>{item.role.replace('_', ' ')}</Text>
            </View>
            {item.userId === user?.uid ? <Text style={styles.youBadge}>You</Text> : null}
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  restrictions: {
    ...typography.caption,
    color: colors.textSubtle,
    textAlign: 'center',
  },
  textArea: {
    minHeight: 112,
    textAlignVertical: 'top',
  },
  body: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  code: {
    ...typography.hero,
    color: tabAccents.communities,
    letterSpacing: 4,
  },
  hint: {
    ...typography.caption,
    color: colors.textSubtle,
    marginTop: spacing.sm,
  },
  memberRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  memberBody: {
    flex: 1,
    gap: 2,
  },
  memberName: {
    ...typography.bodySmall,
    color: colors.text,
    fontFamily: fonts.semibold,
  },
  memberMeta: {
    ...typography.caption,
    color: colors.textSubtle,
    textTransform: 'capitalize',
  },
  youBadge: {
    ...typography.caption,
    color: tabAccents.communities,
    fontFamily: fonts.bold,
  },
  loading: {
    ...typography.body,
    color: colors.textSubtle,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
  },
});
