import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, StyleSheet } from 'react-native';

import { getToolkitSection } from '../content/toolkit';

import { CommunitiesScreen } from '../screens/CommunitiesScreen';
import { CommunityDetailScreen } from '../screens/CommunityDetailScreen';
import { CommunityFormScreen } from '../screens/CommunityFormScreen';
import { ContactDetailScreen } from '../screens/ContactDetailScreen';
import { ContactFormScreen } from '../screens/ContactFormScreen';
import { ImportContactsScreen } from '../screens/ImportContactsScreen';
import { ContactsScreen } from '../screens/ContactsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { JoinCommunityScreen } from '../screens/JoinCommunityScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ToolkitScreen } from '../screens/ToolkitScreen';
import { ToolkitSectionScreen } from '../screens/ToolkitSectionScreen';
import { StudiesScreen } from '../screens/StudiesScreen';
import { StudyDetailScreen } from '../screens/StudyDetailScreen';
import { fonts, layout, navigationTheme, typography } from '../theme';
import { homeColors } from '../theme/home';
import type {
  CommunitiesStackParamList,
  ContactsStackParamList,
  HomeStackParamList,
  StudiesStackParamList,
  TabParamList,
} from './types';

const Tab = createBottomTabNavigator<TabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ContactsStack = createNativeStackNavigator<ContactsStackParamList>();
const StudiesStack = createNativeStackNavigator<StudiesStackParamList>();
const CommunitiesStack = createNativeStackNavigator<CommunitiesStackParamList>();

const stackScreenOptions = {
  headerStyle: { backgroundColor: homeColors.canvas },
  headerShadowVisible: false,
  headerTintColor: homeColors.ink,
  headerTitleStyle: { ...typography.title, color: homeColors.ink },
  contentStyle: { backgroundColor: homeColors.canvas },
};

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen component={HomeScreen} name="Home" options={{ headerShown: false }} />
      <HomeStack.Screen component={ProfileScreen} name="Profile" options={{ title: 'Profile' }} />
      <HomeStack.Screen component={ToolkitScreen} name="Toolkit" options={{ title: 'Toolkit' }} />
      <HomeStack.Screen
        component={ToolkitSectionScreen}
        name="ToolkitSection"
        options={({ route }) => ({
          title: getToolkitSection(route.params.sectionId)?.title ?? 'Toolkit',
        })}
      />
    </HomeStack.Navigator>
  );
}

function ContactsStackNavigator() {
  return (
    <ContactsStack.Navigator screenOptions={stackScreenOptions}>
      <ContactsStack.Screen
        component={ContactsScreen}
        name="Contacts"
        options={{ headerShown: false }}
      />
      <ContactsStack.Screen
        component={ContactFormScreen}
        name="ContactForm"
        options={({ route }) => ({
          title: route.params?.contactId ? 'Edit contact' : 'New contact',
        })}
      />
      <ContactsStack.Screen
        component={ContactDetailScreen}
        name="ContactDetail"
        options={{ title: 'Contact details' }}
      />
      <ContactsStack.Screen
        component={ImportContactsScreen}
        name="ImportContacts"
        options={{ title: 'Import from phone' }}
      />
    </ContactsStack.Navigator>
  );
}

function StudiesStackNavigator() {
  return (
    <StudiesStack.Navigator screenOptions={stackScreenOptions}>
      <StudiesStack.Screen
        component={StudiesScreen}
        name="Studies"
        options={{ headerShown: false }}
      />
      <StudiesStack.Screen
        component={StudyDetailScreen}
        name="StudyDetail"
        options={{ title: 'Study details' }}
      />
    </StudiesStack.Navigator>
  );
}

function CommunitiesStackNavigator() {
  return (
    <CommunitiesStack.Navigator screenOptions={stackScreenOptions}>
      <CommunitiesStack.Screen
        component={CommunitiesScreen}
        name="Communities"
        options={{ headerShown: false }}
      />
      <CommunitiesStack.Screen
        component={CommunityFormScreen}
        name="CommunityForm"
        options={{ title: 'Create community' }}
      />
      <CommunitiesStack.Screen
        component={JoinCommunityScreen}
        name="JoinCommunity"
        options={{ title: 'Join community' }}
      />
      <CommunitiesStack.Screen
        component={CommunityDetailScreen}
        name="CommunityDetail"
        options={{ title: 'Community' }}
      />
    </CommunitiesStack.Navigator>
  );
}

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: navigationTheme.tabActive,
        tabBarInactiveTintColor: navigationTheme.tabInactive,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        component={HomeStackNavigator}
        name="HomeTab"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="home-outline" size={size} />
          ),
        }}
      />
      <Tab.Screen
        component={ContactsStackNavigator}
        name="ContactsTab"
        options={{
          tabBarLabel: 'Contacts',
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="people-outline" size={size} />
          ),
        }}
      />
      <Tab.Screen
        component={StudiesStackNavigator}
        name="StudiesTab"
        options={{
          tabBarLabel: 'Studies',
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="book-outline" size={size} />
          ),
        }}
      />
      <Tab.Screen
        component={CommunitiesStackNavigator}
        name="CommunitiesTab"
        options={{
          tabBarLabel: 'Communities',
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="people-circle-outline" size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: homeColors.tileWhite,
    borderTopColor: '#D5DEE8',
    height: Platform.OS === 'ios' ? layout.tabBarHeight : 60,
    paddingBottom: Platform.OS === 'ios' ? 8 : 6,
    paddingTop: 6,
  },
  tabLabel: {
    ...typography.caption,
    fontFamily: fonts.semibold,
    fontSize: 11,
  },
});
