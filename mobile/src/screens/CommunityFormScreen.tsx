import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import type { CommunitiesStackParamList } from '../navigation/types';
import { useAuth } from '../providers/AuthProvider';
import { pickCommunityIcon } from '../services/communityIcon';
import { createCommunity } from '../services/communities';
import { Button } from '../shared/components/Button';
import { Card } from '../shared/components/Card';
import { Chip } from '../shared/components/Chip';
import { CommunityIconPicker } from '../shared/components/CommunityAvatar';
import { Screen, TextField } from '../shared/components/Screen';
import {
  buildCommunityRestrictions,
  type CommunityGenderFilter,
} from '../utils/communityRestrictions';
import { colors, fonts, spacing, typography } from '../theme';
import { homeColors, tabAccentSoft, tabAccents } from '../theme/home';

type Props = NativeStackScreenProps<CommunitiesStackParamList, 'CommunityForm'>;

const GENDER_FILTERS: { value: CommunityGenderFilter; label: string }[] = [
  { value: 'open', label: 'Everyone' },
  { value: 'female', label: 'Women only' },
  { value: 'male', label: 'Men only' },
];

export function CommunityFormScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconUri, setIconUri] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<CommunityGenderFilter>('open');
  const [minimumAgeEnabled, setMinimumAgeEnabled] = useState(false);
  const [minimumAgeText, setMinimumAgeText] = useState('18');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handlePickIcon() {
    setError('');

    try {
      const pickedUri = await pickCommunityIcon();
      if (pickedUri) {
        setIconUri(pickedUri);
      }
    } catch (pickError) {
      const message = pickError instanceof Error ? pickError.message : 'Could not pick an image.';
      setError(message);
    }
  }

  async function handleCreate() {
    setLoading(true);
    setError('');

    try {
      const restrictions = buildCommunityRestrictions({
        genderFilter,
        minimumAgeText: minimumAgeEnabled ? minimumAgeText : '',
      });

      const result = await createCommunity({
        name,
        description,
        creatorDisplayName: profile?.firstName ?? profile?.displayName ?? 'Member',
        restrictions,
        iconUri,
      });

      navigation.replace('CommunityDetail', { communityId: result.communityId });
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : 'Could not create community.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen
      scroll
      accent={tabAccents.communities}
      showBrand={false}
      subtitle="Set a name, optional icon, and who can join."
      title="Create community"
      footer={
        <>
          <Button
            disabled={!name.trim() || loading}
            label="Create community"
            loading={loading}
            onPress={handleCreate}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </>
      }
    >
      <View style={styles.iconSection}>
        <CommunityIconPicker iconUri={iconUri} name={name} onPress={handlePickIcon} />
      </View>

      <Card title="Community details">
        <TextField
          autoCapitalize="words"
          label="Community name"
          onChangeText={setName}
          placeholder="Eastside outreach"
          value={name}
        />
        <TextField
          label="Description (optional)"
          multiline
          numberOfLines={3}
          onChangeText={setDescription}
          placeholder="What this community is for"
          style={styles.textArea}
          value={description}
        />
      </Card>

      <Card title="Who can join">
        <Text style={styles.sectionHint}>Members must match these filters when joining with a code.</Text>
        <ScrollView
          contentContainerStyle={styles.chipRow}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {GENDER_FILTERS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              onPress={() => setGenderFilter(option.value)}
              selected={genderFilter === option.value}
            />
          ))}
        </ScrollView>

        <View style={styles.ageRow}>
          <View style={styles.ageCopy}>
            <Text style={styles.ageLabel}>Minimum age</Text>
            <Text style={styles.ageHint}>Requires birthday in Profile to join</Text>
          </View>
          <Switch
            onValueChange={setMinimumAgeEnabled}
            thumbColor={colors.white}
            trackColor={{ false: colors.border, true: colors.primarySoft }}
            value={minimumAgeEnabled}
          />
        </View>

        {minimumAgeEnabled ? (
          <TextField
            keyboardType="number-pad"
            label="Minimum age"
            maxLength={3}
            onChangeText={setMinimumAgeText}
            placeholder="18"
            value={minimumAgeText}
          />
        ) : null}

        {genderFilter !== 'open' || minimumAgeEnabled ? (
          <View style={styles.notice}>
            <Ionicons color={tabAccents.communities} name="information-circle-outline" size={18} />
            <Text style={styles.noticeText}>
              People who do not match these filters will not be able to join with the invite code.
            </Text>
          </View>
        ) : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconSection: {
    alignItems: 'center',
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  sectionHint: {
    ...typography.caption,
    color: colors.textSubtle,
    marginBottom: spacing.sm,
  },
  chipRow: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  ageRow: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  ageCopy: {
    flex: 1,
    gap: 2,
  },
  ageLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontFamily: fonts.semibold,
  },
  ageHint: {
    ...typography.caption,
    color: colors.textSubtle,
  },
  notice: {
    alignItems: 'flex-start',
    backgroundColor: tabAccentSoft.communities,
    borderRadius: 12,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  noticeText: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
  },
});
