import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, gradients } from '../../theme';

type GradientVariant = keyof typeof gradients;

type GradientViewProps = {
  variant?: GradientVariant;
  colors?: readonly [string, string, ...string[]];
  style?: StyleProp<ViewStyle>;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  children?: React.ReactNode;
};

export function GradientView({
  variant = 'brand',
  colors: customColors,
  style,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  children,
}: GradientViewProps) {
  const palette = customColors ?? gradients[variant];

  return (
    <LinearGradient colors={[...palette]} end={end} start={start} style={style}>
      {children}
    </LinearGradient>
  );
}

export function GradientBorder({
  borderWidth = 2,
  borderRadius = 999,
  innerColor = colors.surface,
  style,
  children,
}: {
  borderWidth?: number;
  borderRadius?: number;
  innerColor?: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const innerRadius = Math.max(borderRadius - borderWidth, 0);

  return (
    <GradientView
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={[{ borderRadius, padding: borderWidth }, style]}
    >
      <View
        style={[
          styles.inner,
          { backgroundColor: innerColor, borderRadius: innerRadius },
        ]}
      >
        {children}
      </View>
    </GradientView>
  );
}

const styles = StyleSheet.create({
  inner: {
    overflow: 'hidden',
  },
});
