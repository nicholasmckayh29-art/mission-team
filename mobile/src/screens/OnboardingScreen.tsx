import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../providers/AuthProvider';
import { completeOnboarding } from '../services/users';
import { Button } from '../shared/components/Button';
import { Card } from '../shared/components/Card';
import { Screen, TextField } from '../shared/components/Screen';
import { colors, fonts, spacing, typography } from '../theme';
import type { Gender } from '../types';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export function OnboardingScreen() {
  const { profile, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState(profile?.firstName ?? '');
  const [birthday, setBirthday] = useState(profile?.birthday ?? '');
  const [gender, setGender] = useState<Gender | ''>((profile?.gender as Gender) ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setError('');

    if (!firstName.trim()) {
      setError('First name is required.');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday.trim())) {
      setError('Birthday must use YYYY-MM-DD format.');
      return;
    }

    if (!gender) {
      setError('Select a gender option.');
      return;
    }

    setLoading(true);

    try {
      await completeOnboarding({
        firstName: firstName.trim(),
        birthday: birthday.trim(),
        gender,
      });
      await refreshProfile();
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : 'Could not save your profile.';
      if (message.toLowerCase().includes('permission') || message.includes('insufficient')) {
        setError(
          'Firestore blocked the save. Deploy firestore.rules, then try again.',
        );
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen
      subtitle="Google may not provide birthday or gender. We store these only for your account."
      title="Set up your profile"
      footer={
        <>
          <Button label="Save and continue" loading={loading} onPress={handleSubmit} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </>
      }
    >
      <Card subtitle="Step 1 of 1 · Profile basics">
        <TextField
          autoCapitalize="words"
          label="First name"
          onChangeText={setFirstName}
          placeholder="Alex"
          value={firstName}
        />
        <TextField
          autoCapitalize="none"
          hint="Example: 1990-04-15"
          label="Birthday"
          onChangeText={setBirthday}
          placeholder="1990-04-15"
          value={birthday}
        />
        <View style={styles.field}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.options}>
            {GENDER_OPTIONS.map((option) => {
              const selected = gender === option.value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => setGender(option.value)}
                  style={[styles.option, selected && styles.optionSelected]}
                >
                  <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.text,
    fontFamily: fonts.bold,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  optionLabel: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  optionLabelSelected: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
  },
});
