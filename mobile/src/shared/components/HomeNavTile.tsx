import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { homeColors, homeLayout } from '../../theme/home';
import { fonts, radius } from '../../theme';

type HomeNavTileProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  onPress: () => void;
  style?: ViewStyle;
};

export function HomeNavTile({ label, icon, accent, onPress, style }: HomeNavTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.tile, style, pressed && styles.pressed]}
    >
      <Ionicons color={accent} name={icon} size={42} />
      <Text style={[styles.label, { color: accent }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    backgroundColor: homeColors.tileBlack,
    borderRadius: radius.lg,
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    minHeight: homeLayout.tileSize,
    padding: 16,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.98 }],
  },
  label: {
    fontFamily: fonts.extraBold,
    fontSize: 13,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
});
