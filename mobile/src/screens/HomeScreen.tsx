import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { HomeStackParamList, TabParamList } from '../navigation/types';
import { HomeActivityFeed } from '../shared/components/HomeActivityFeed';
import { HomeNavTile } from '../shared/components/HomeNavTile';
import { MissionTeamLogo } from '../shared/components/MissionTeamLogo';
import { ProfileAvatarButton } from '../shared/components/ProfileAvatarButton';
import { ScriptureDynamicIsland } from '../shared/components/ScriptureDynamicIsland';
import { useContacts } from '../shared/hooks/useContacts';
import { useStudies } from '../shared/hooks/useStudies';
import { fonts, layout, radius, spacing } from '../theme';
import { homeColors, homeLayout } from '../theme/home';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Home'>,
  BottomTabScreenProps<TabParamList, 'HomeTab'>
>;

export function HomeScreen({ navigation }: Props) {
  const { contacts } = useContacts();
  const { faithfulContacts } = useStudies(contacts);
  const followUpContacts = contacts.filter((contact) => contact.status === 'follow_up');
  const [faithModeEnabled, setFaithModeEnabled] = useState(false);

  function toggleFaithMode(value: boolean) {
    setFaithModeEnabled(value);
    if (value) {
      Alert.alert('Faith Mode', 'Live location sharing is coming in a future update.');
      setFaithModeEnabled(false);
    }
  }

  return (
    <View style={styles.canvas}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <MissionTeamLogo />
            <ProfileAvatarButton onPress={() => navigation.navigate('Profile')} />
          </View>

          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('ContactsTab', { screen: 'ContactForm' })}
              style={({ pressed }) => [styles.addContact, pressed && styles.pressed]}
            >
              <Ionicons color={homeColors.ink} name="person-add-outline" size={22} />
              <Text style={styles.addContactLabel}>ADD NEW CONTACT</Text>
            </Pressable>

            <View style={styles.faithMode}>
              <View style={styles.faithPin}>
                <Ionicons color={homeColors.ink} name="location" size={22} />
              </View>
              <View style={styles.faithModeCopy}>
                <Text style={styles.faithModeLabel}>FAITH MODE</Text>
                <Text style={styles.faithModeSub}>ON/OFF</Text>
              </View>
              <Switch
                onValueChange={toggleFaithMode}
                thumbColor={homeColors.tileWhite}
                trackColor={{ false: '#CFCFCF', true: homeColors.goldDeep }}
                value={faithModeEnabled}
              />
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.gridRow}>
              <HomeNavTile
                accent={homeColors.tileYellow}
                icon="people-outline"
                label="MY FRIENDS"
                onPress={() => navigation.navigate('ContactsTab')}
              />
              <HomeNavTile
                accent={homeColors.tileGreen}
                icon="calendar-outline"
                label="MY STUDIES"
                onPress={() => navigation.navigate('StudiesTab')}
              />
            </View>
            <View style={styles.gridRow}>
              <HomeNavTile
                accent={homeColors.tileBlue}
                icon="people-circle-outline"
                label="COMMUNITIES"
                onPress={() => navigation.navigate('CommunitiesTab')}
              />
              <HomeNavTile
                accent={homeColors.tileWhite}
                icon="settings-outline"
                label="MY TOOLKIT"
                onPress={() => navigation.navigate('Toolkit')}
              />
            </View>
          </View>

          <ScriptureDynamicIsland variant="embedded" />

          <HomeActivityFeed
            followUpContacts={followUpContacts}
            onOpenContact={(contactId) =>
              navigation.navigate('ContactsTab', {
                screen: 'ContactDetail',
                params: { contactId },
              })
            }
            studyCount={faithfulContacts.length}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: homeColors.canvas,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    alignSelf: 'center',
    gap: spacing.lg,
    maxWidth: layout.maxContentWidth,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addContact: {
    alignItems: 'center',
    backgroundColor: homeColors.gold,
    borderRadius: radius.lg,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: spacing.md,
  },
  addContactLabel: {
    color: homeColors.ink,
    fontFamily: fonts.extraBold,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  faithMode: {
    alignItems: 'center',
    backgroundColor: homeColors.tileWhite,
    borderColor: homeColors.goldDeep,
    borderRadius: radius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: 148,
  },
  faithPin: {
    alignItems: 'center',
    backgroundColor: homeColors.gold,
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  faithModeCopy: {
    flex: 1,
  },
  faithModeLabel: {
    color: homeColors.ink,
    fontFamily: fonts.extraBold,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  faithModeSub: {
    color: homeColors.muted,
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 0.3,
  },
  grid: {
    gap: homeLayout.tileGap,
  },
  gridRow: {
    flexDirection: 'row',
    gap: homeLayout.tileGap,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
});
