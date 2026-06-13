import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import type { HomeStackParamList } from '../navigation/types';
import { useAuth } from '../providers/AuthProvider';
import {
  pickProfilePhoto,
  updateProfileName,
  uploadProfilePhoto,
} from '../services/users';
import { resolveProfilePhotoUri } from '../services/profilePhoto';
import { useProfilePhotoUri } from '../shared/hooks/useProfilePhotoUri';
import { Button } from '../shared/components/Button';
import { Screen, TextField } from '../shared/components/Screen';
import { confirm } from '../shared/utils/confirm';
import { colors, fonts, spacing, typography } from '../theme';
import { tabAccents, homeColors } from '../theme/home';

type Props = NativeStackScreenProps<HomeStackParamList, 'Profile'>;

export function ProfileScreen(_props: Props) {
  const { profile, refreshProfile, signOutUser, user } = useAuth();
  const resolvedPhotoUri = useProfilePhotoUri();
  const [firstName, setFirstName] = useState(profile?.firstName ?? '');
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [photoUri, setPhotoUri] = useState(resolvedPhotoUri ?? '');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFirstName(profile?.firstName ?? '');
    setDisplayName(profile?.displayName ?? '');
  }, [profile?.displayName, profile?.firstName]);

  useEffect(() => {
    setPhotoUri(resolvedPhotoUri ?? '');
  }, [resolvedPhotoUri]);

  async function handleSaveName() {
    setSaving(true);
    setError('');

    try {
      await updateProfileName({ firstName, displayName });
      await refreshProfile();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Could not save profile.';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePickPhoto() {
    setUploadingPhoto(true);
    setError('');

    try {
      const uri = await pickProfilePhoto();
      if (!uri) {
        return;
      }

      const storedMarker = await uploadProfilePhoto(uri);
      const displayUri = await resolveProfilePhotoUri(storedMarker, user?.uid);
      setPhotoUri(displayUri ?? '');
      await refreshProfile();
    } catch (photoError) {
      const message = photoError instanceof Error ? photoError.message : 'Could not upload photo.';
      setError(message);
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSignOut() {
    const confirmed = await confirm({
      title: 'Sign out',
      message: 'Sign out of Mission Team on this device?',
      confirmLabel: 'Sign out',
      destructive: true,
    });

    if (!confirmed) {
      return;
    }

    setError('');

    try {
      await signOutUser();
    } catch (signOutError) {
      const message =
        signOutError instanceof Error ? signOutError.message : 'Could not sign out.';
      setError(message);
    }
  }

  return (
    <Screen
      scroll
      accent={tabAccents.profile}
      showBrand={false}
      subtitle={profile?.email ?? 'Manage your ministry profile'}
      title="Profile"
      footer={
        <>
          <Button disabled={!firstName.trim() || saving} label="Save name" loading={saving} onPress={handleSaveName} />
          <Button label="Sign out" onPress={() => void handleSignOut()} variant="danger" />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </>
      }
    >
      <View style={styles.photoSection}>
        <View style={styles.photoFrame}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoInitial}>
                {(firstName[0] ?? '?').toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <Button
          label={uploadingPhoto ? 'Saving...' : 'Choose profile photo'}
          loading={uploadingPhoto}
          onPress={handlePickPhoto}
          variant="secondary"
        />
        <Text style={styles.photoHint}>Saved on this device only until cloud storage is enabled.</Text>
      </View>

      <TextField
        autoCapitalize="words"
        label="First name"
        onChangeText={setFirstName}
        placeholder="Your first name"
        value={firstName}
      />
      <TextField
        autoCapitalize="words"
        label="Display name"
        onChangeText={setDisplayName}
        placeholder="How others see you"
        value={displayName}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  photoSection: {
    alignItems: 'center',
    gap: spacing.md,
  },
  photoFrame: {
    borderColor: homeColors.ink,
    borderRadius: 999,
    borderWidth: 3,
    height: 112,
    overflow: 'hidden',
    width: 112,
  },
  photo: {
    height: '100%',
    width: '100%',
  },
  photoPlaceholder: {
    alignItems: 'center',
    backgroundColor: homeColors.feedFaith,
    flex: 1,
    justifyContent: 'center',
  },
  photoInitial: {
    color: homeColors.ink,
    fontFamily: fonts.extraBold,
    fontSize: 40,
  },
  photoHint: {
    ...typography.caption,
    color: colors.textSubtle,
    textAlign: 'center',
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
  },
});
