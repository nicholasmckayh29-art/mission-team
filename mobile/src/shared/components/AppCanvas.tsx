import { StyleSheet, View, type ViewStyle } from 'react-native';

import { homeColors } from '../../theme/home';

type AppCanvasProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function AppCanvas({ children, style }: AppCanvasProps) {
  return <View style={[styles.canvas, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: homeColors.canvas,
    flex: 1,
  },
});
