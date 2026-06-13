import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useCommunityIconUri } from '../hooks/useCommunityIconUri';
import { colors, fonts } from '../../theme';
import { homeColors } from '../../theme/home';

type CommunityAvatarProps = {
  communityId: string;
  imageUrl?: string;
  name: string;
  size?: number;
  onPress?: () => void;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function CommunityAvatar({
  communityId,
  imageUrl,
  name,
  size = 48,
  onPress,
}: CommunityAvatarProps) {
  const uri = useCommunityIconUri(communityId, imageUrl);
  const radius = size / 2;
  const fontSize = Math.max(12, size * 0.34);

  const content = uri ? (
    <Image source={{ uri }} style={styles.image} />
  ) : (
    <View style={[styles.placeholder, { borderRadius: radius }]}>
      <Text style={[styles.initials, { fontSize }]}>{initialsFromName(name)}</Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityLabel={`${name} group icon`}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.container,
          { height: size, width: size, borderRadius: radius },
          pressed && styles.pressed,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, { height: size, width: size, borderRadius: radius }]}>
      {content}
    </View>
  );
}

type CommunityIconPickerProps = {
  iconUri: string | null;
  name: string;
  onPress: () => void;
  size?: number;
};

export function CommunityIconPicker({
  iconUri,
  name,
  onPress,
  size = 120,
}: CommunityIconPickerProps) {
  const radius = size / 2;
  const fontSize = Math.max(16, size * 0.28);

  return (
    <Pressable
      accessibilityLabel="Choose group icon"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pickerWrap, pressed && styles.pressed]}
    >
      <View style={[styles.picker, { height: size, width: size, borderRadius: radius }]}>
        {iconUri ? (
          <Image source={{ uri: iconUri }} style={styles.image} />
        ) : (
          <View style={[styles.placeholder, { borderRadius: radius }]}>
            <Ionicons color={colors.textSubtle} name="people" size={size * 0.34} />
            {name.trim() ? (
              <Text style={[styles.initials, { fontSize }]}>{initialsFromName(name)}</Text>
            ) : null}
          </View>
        )}
        <View style={styles.cameraBadge}>
          <Ionicons color={homeColors.ink} name="camera" size={18} />
        </View>
      </View>
      <Text style={styles.pickerHint}>Add group icon</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.92,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  placeholder: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    flex: 1,
    justifyContent: 'center',
  },
  initials: {
    color: colors.textMuted,
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
  },
  pickerWrap: {
    alignItems: 'center',
    gap: 8,
  },
  picker: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cameraBadge: {
    alignItems: 'center',
    backgroundColor: homeColors.gold,
    borderRadius: 16,
    bottom: 6,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 6,
    width: 32,
  },
  pickerHint: {
    color: homeColors.goldDeep,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
});
