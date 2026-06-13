import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useProfilePhotoUri } from '../../shared/hooks/useProfilePhotoUri';
import { homeColors } from '../../theme/home';

type ProfileAvatarButtonProps = {
  size?: number;
  onPress: () => void;
};

export function ProfileAvatarButton({ size = 48, onPress }: ProfileAvatarButtonProps) {
  const photoUri = useProfilePhotoUri();

  return (
    <Pressable
      accessibilityLabel="Open profile"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { height: size, width: size, borderRadius: size / 2 },
        pressed && styles.pressed,
      ]}
    >
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.image} />
      ) : (
        <View style={[styles.placeholder, { borderRadius: size / 2 }]}>
          <Ionicons color={homeColors.tileBlue} name="person" size={size * 0.5} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderColor: homeColors.ink,
    borderWidth: 2,
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
    backgroundColor: '#DCEEF8',
    flex: 1,
    justifyContent: 'center',
  },
});
