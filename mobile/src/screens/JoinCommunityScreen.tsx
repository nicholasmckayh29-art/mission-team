import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { CommunitiesStackParamList } from '../navigation/types';
import { useAuth } from '../providers/AuthProvider';
import { getCommunityCodePreview, joinCommunityByCode } from '../services/communities';
import { Button } from '../shared/components/Button';
import { Card } from '../shared/components/Card';
import { CommunityAvatar } from '../shared/components/CommunityAvatar';
import { Screen, TextField } from '../shared/components/Screen';
import {
  formatRestrictionsSummary,
  validateProfileForCommunity,
} from '../utils/communityRestrictions';
import { colors, fonts, spacing, typography } from '../theme';
import { tabAccents } from '../theme/home';
import type { CommunityCodePreview } from '../types';

type Props = NativeStackScreenProps<CommunitiesStackParamList, 'JoinCommunity'>;

export function JoinCommunityScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const [code, setCode] = useState('');
  const [preview, setPreview] = useState<CommunityCodePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const normalizedCode = code.trim().toUpperCase();
    if (normalizedCode.length < 4) {
      setPreview(null);
      setPreviewLoading(false);
      return;
    }

    let cancelled = false;
    setPreviewLoading(true);

    void getCommunityCodePreview(normalizedCode).then((nextPreview) => {
      if (!cancelled) {
        setPreview(nextPreview);
        setPreviewLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [code]);

  const eligibility = preview
    ? validateProfileForCommunity(profile, preview.restrictions)
    : null;

  async function handleJoin() {
    setLoading(true);
    setError('');

    try {
      const communityId = await joinCommunityByCode(
        code,
        profile?.firstName ?? profile?.displayName ?? 'Member',
        profile,
      );

      navigation.replace('CommunityDetail', { communityId });
    } catch (joinError) {
      const message = joinError instanceof Error ? joinError.message : 'Could not join community.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const canJoin = Boolean(preview) && eligibility?.allowed && !loading;

  return (
    <Screen
      accent={tabAccents.communities}
      showBrand={false}
      subtitle="Enter the invite code shared by a community admin."
      title="Join community"
      footer={
        <>
          <Button
            disabled={!canJoin}
            label="Join community"
            loading={loading}
            onPress={handleJoin}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </>
      }
    >
      <Card title="Invite code">
        <TextField
          autoCapitalize="characters"
          autoCorrect={false}
          label="Community code"
          maxLength={8}
          onChangeText={(value) => setCode(value.toUpperCase())}
          placeholder="ABC123"
          value={code}
        />
      </Card>

      {previewLoading ? <Text style={styles.previewStatus}>Looking up community...</Text> : null}

      {preview ? (
        <Card title="Community preview">
          <View style={styles.previewRow}>
            <CommunityAvatar
              communityId={preview.communityId}
              imageUrl={preview.imageUrl}
              name={preview.name}
              size={56}
            />
            <View style={styles.previewBody}>
              <Text style={styles.previewName}>{preview.name}</Text>
              <Text style={styles.previewMeta}>{formatRestrictionsSummary(preview.restrictions)}</Text>
            </View>
          </View>

          {eligibility && !eligibility.allowed ? (
            <Text style={styles.blocked}>{eligibility.message}</Text>
          ) : (
            <Text style={styles.ready}>You can join this community.</Text>
          )}
        </Card>
      ) : null}

      {!previewLoading && code.trim().length >= 4 && !preview ? (
        <Text style={styles.previewStatus}>No community found for that code.</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  previewRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  previewBody: {
    flex: 1,
    gap: 4,
  },
  previewName: {
    ...typography.title,
    color: colors.text,
  },
  previewMeta: {
    ...typography.caption,
    color: colors.textSubtle,
  },
  previewStatus: {
    ...typography.bodySmall,
    color: colors.textSubtle,
    paddingHorizontal: spacing.xs,
  },
  ready: {
    ...typography.caption,
    color: tabAccents.communities,
    fontFamily: fonts.semibold,
    marginTop: spacing.sm,
  },
  blocked: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.sm,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
  },
});
