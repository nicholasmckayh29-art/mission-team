import { StyleSheet, Text, View } from 'react-native';

import { homeColors } from '../../theme/home';
import { fonts } from '../../theme';

export function MissionTeamLogo() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.mission}>MISSION</Text>
      <Text style={styles.team}>team</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 4,
  },
  mission: {
    color: homeColors.ink,
    fontFamily: fonts.extraBold,
    fontSize: 28,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    ...StyleSheet.flatten([
      {
        textShadowColor: homeColors.ink,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 0.5,
      },
    ]),
  },
  team: {
    color: homeColors.ink,
    fontFamily: fonts.semibold,
    fontSize: 22,
    fontStyle: 'italic',
    marginBottom: 2,
  },
});
