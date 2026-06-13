import type { NavigatorScreenParams } from '@react-navigation/native';

import type { ToolkitSectionId } from '../content/toolkit';

export type TabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList> | undefined;
  ContactsTab: NavigatorScreenParams<ContactsStackParamList> | undefined;
  StudiesTab: NavigatorScreenParams<StudiesStackParamList> | undefined;
  CommunitiesTab: NavigatorScreenParams<CommunitiesStackParamList> | undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Profile: undefined;
  Toolkit: undefined;
  ToolkitSection: { sectionId: ToolkitSectionId };
};

export type ContactsStackParamList = {
  Contacts: undefined;
  ContactForm: { contactId?: string } | undefined;
  ContactDetail: { contactId: string };
  ImportContacts: undefined;
};

export type StudiesStackParamList = {
  Studies: undefined;
  StudyDetail: { contactId: string };
};

export type CommunitiesStackParamList = {
  Communities: undefined;
  CommunityForm: undefined;
  JoinCommunity: undefined;
  CommunityDetail: { communityId: string };
};

export type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  Main: undefined;
};

/** @deprecated Use ContactsStackParamList for contact screens. */
export type MainStackParamList = ContactsStackParamList;
