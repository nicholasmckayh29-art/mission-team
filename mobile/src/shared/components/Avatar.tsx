import { StyleSheet, Text, View } from 'react-native';

import { fonts, typography } from '../../theme';
import { homeColors, tabAccentSoft } from '../../theme/home';

type AvatarProps = {
  name: string;
  size?: number;
  ring?: boolean;
  accent?: string;
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

function softAccent(accent: string) {
  if (accent === homeColors.tileYellow) {
    return tabAccentSoft.contacts;
  }

  if (accent === homeColors.tileGreen) {
    return tabAccentSoft.studies;
  }

  if (accent === homeColors.tileBlue) {
    return tabAccentSoft.communities;
  }

  return tabAccentSoft.profile;
}

export function Avatar({ name, size = 44, ring = true, accent = homeColors.tileYellow }: AvatarProps) {
  const initials = initialsFromName(name);
  const innerSize = ring ? size - 4 : size;

  const avatar = (
    <View
      style={[
        styles.avatar,
        {
          backgroundColor: softAccent(accent),
          height: innerSize,
          width: innerSize,
          borderRadius: innerSize / 2,
        },
      ]}
    >
      <Text style={[styles.label, { fontSize: innerSize * 0.36 }]}>{initials}</Text>
    </View>
  );

  if (!ring) {
    return avatar;
  }

  return (
    <View
      style={[
        styles.ring,
        {
          borderColor: accent,
          borderRadius: size / 2,
          height: size,
          width: size,
        },
      ]}
    >
      {avatar}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    borderWidth: 2,
    justifyContent: 'center',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.caption,
    color: homeColors.ink,
    fontFamily: fonts.extraBold,
  },
});
