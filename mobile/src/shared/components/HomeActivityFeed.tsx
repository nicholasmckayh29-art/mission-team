import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Contact } from '../../types';
import { homeColors, homeLayout } from '../../theme/home';
import { fonts, radius } from '../../theme';

type FeedItem =
  | {
      id: string;
      kind: 'follow_up';
      label: string;
      contactId: string;
    }
  | {
      id: string;
      kind: 'study';
      label: string;
    }
  | {
      id: string;
      kind: 'placeholder';
      label: string;
      tone: 'invite' | 'challenge' | 'faith';
    };

type HomeActivityFeedProps = {
  followUpContacts: Contact[];
  studyCount: number;
  onOpenContact: (contactId: string) => void;
};

function buildFeedItems(followUpContacts: Contact[], studyCount: number): FeedItem[] {
  const items: FeedItem[] = followUpContacts.slice(0, 3).map((contact) => ({
    id: `follow-${contact.id}`,
    kind: 'follow_up',
    label: `CONTACT: FOLLOW-UP ${contact.name.toUpperCase()}`,
    contactId: contact.id,
  }));

  if (studyCount > 0) {
    items.push({
      id: 'study-challenge',
      kind: 'study',
      label: `CHALLENGE: ${studyCount} DISCIPLE${studyCount === 1 ? '' : 'S'} IN STUDY`,
    });
  }

  if (items.length === 0) {
    items.push({
      id: 'invite-placeholder',
      kind: 'placeholder',
      label: 'JOIN A COMMUNITY FROM THE COMMUNITIES TAB',
      tone: 'invite',
    });
  }

  items.push({
    id: 'faith-placeholder',
    kind: 'placeholder',
    label: 'FAITH MODE COMING SOON',
    tone: 'faith',
  });

  return items.slice(0, 4);
}

function toneColor(tone: FeedItem['kind'], placeholderTone?: 'invite' | 'challenge' | 'faith') {
  if (tone === 'follow_up') {
    return homeColors.feedContact;
  }

  if (tone === 'study') {
    return homeColors.feedChallenge;
  }

  if (placeholderTone === 'invite') {
    return homeColors.feedInvite;
  }

  if (placeholderTone === 'challenge') {
    return homeColors.feedChallenge;
  }

  return homeColors.feedFaith;
}

export function HomeActivityFeed({
  followUpContacts,
  studyCount,
  onOpenContact,
}: HomeActivityFeedProps) {
  const items = buildFeedItems(followUpContacts, studyCount);

  return (
    <View style={styles.list}>
      {items.map((item) => {
        const backgroundColor = toneColor(
          item.kind,
          item.kind === 'placeholder' ? item.tone : undefined,
        );

        return (
          <Pressable
            key={item.id}
            disabled={item.kind !== 'follow_up'}
            onPress={() => {
              if (item.kind === 'follow_up') {
                onOpenContact(item.contactId);
              }
            }}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor },
              pressed && item.kind === 'follow_up' && styles.rowPressed,
            ]}
          >
            <Text numberOfLines={2} style={styles.label}>
              {item.label}
            </Text>
            {item.kind === 'follow_up' ? (
              <View style={styles.action}>
                <Ionicons color={homeColors.ink} name="call-outline" size={18} />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  row: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 12,
    minHeight: homeLayout.feedRowHeight,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  rowPressed: {
    opacity: 0.92,
  },
  label: {
    color: homeColors.ink,
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  action: {
    alignItems: 'center',
    backgroundColor: homeColors.ink,
    borderRadius: radius.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
});
