import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ContactsStackParamList } from '../navigation/types';
import { processOverdueReminders, subscribeContacts } from '../services/contacts';
import { filterSavedContacts, isPhoneContactImportAvailable } from '../services/deviceContacts';
import { AppCanvas } from '../shared/components/AppCanvas';
import { Avatar } from '../shared/components/Avatar';
import { Button } from '../shared/components/Button';
import { Chip } from '../shared/components/Chip';
import { EmptyState } from '../shared/components/EmptyState';
import { StatusBadge } from '../shared/components/StatusBadge';
import { TabScreenHeader } from '../shared/components/TabScreenHeader';
import { fonts, layout, radius, spacing, typography } from '../theme';
import { homeColors, tabAccents } from '../theme/home';
import type { Contact, ContactStatus } from '../types';

type Props = NativeStackScreenProps<ContactsStackParamList, 'Contacts'>;

const ACCENT = tabAccents.contacts;

const FILTERS: Array<{ key: 'all' | ContactStatus; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'follow_up', label: 'Follow up' },
  { key: 'faithful', label: 'Faithful' },
  { key: 'forgotten', label: 'Forgotten' },
  { key: 'backburner', label: 'Backburner' },
];

export function ContactsScreen({ navigation }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const phoneImportAvailable = isPhoneContactImportAvailable();

  const refreshOverdue = useCallback(async (nextContacts: Contact[]) => {
    await processOverdueReminders(nextContacts);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeContacts((nextContacts) => {
      setContacts(nextContacts);
      void refreshOverdue(nextContacts);
    });

    return unsubscribe;
  }, [refreshOverdue]);

  const filteredContacts = useMemo(() => {
    const byStatus =
      filter === 'all' ? contacts : contacts.filter((contact) => contact.status === filter);

    return filterSavedContacts(byStatus, searchQuery);
  }, [contacts, filter, searchQuery]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refreshOverdue(contacts);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <AppCanvas style={styles.flex}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <TabScreenHeader
            accent={ACCENT}
            eyebrow="Contacts"
            subtitle={`${contacts.length} saved · private to your account`}
            title="My friends"
          />

          <ScrollView
            horizontal
            contentContainerStyle={styles.filters}
            showsHorizontalScrollIndicator={false}
          >
            {FILTERS.map((item) => (
              <Chip
                accent={ACCENT}
                key={item.key}
                label={item.label}
                onPress={() => setFilter(item.key)}
                selected={filter === item.key}
              />
            ))}
          </ScrollView>

          <View style={styles.searchWrap}>
            <Ionicons color={homeColors.muted} name="search-outline" size={18} />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              onChangeText={setSearchQuery}
              placeholder="Search saved contacts"
              placeholderTextColor={homeColors.muted}
              style={styles.searchInput}
              value={searchQuery}
            />
          </View>

          <FlatList
            contentContainerStyle={styles.listContent}
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <EmptyState
                actionLabel={searchQuery ? undefined : 'Add contact'}
                body={
                  searchQuery
                    ? 'Try another name, phone number, or email.'
                    : 'Add someone you want to follow up with. They start in follow-up status with a reminder in two days.'
                }
                onAction={searchQuery ? undefined : () => navigation.navigate('ContactForm')}
                title={searchQuery ? 'No matches' : 'No contacts yet'}
              />
            }
            refreshControl={<RefreshControl onRefresh={handleRefresh} refreshing={refreshing} />}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => navigation.navigate('ContactDetail', { contactId: item.id })}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              >
                <Avatar accent={ACCENT} name={item.name} />
                <View style={styles.rowBody}>
                  <View style={styles.rowTop}>
                    <Text numberOfLines={1} style={styles.name}>
                      {item.name}
                    </Text>
                    <StatusBadge compact status={item.status} />
                  </View>
                  {item.notes ? (
                    <Text numberOfLines={2} style={styles.notes}>
                      {item.notes}
                    </Text>
                  ) : null}
                  {item.nextReminderAt && item.status === 'follow_up' ? (
                    <Text style={styles.meta}>
                      Next reminder {item.nextReminderAt.toDate().toLocaleDateString()}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            )}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.footer}>
            <Button label="Add contact" onPress={() => navigation.navigate('ContactForm')} />
            <Button
              label={phoneImportAvailable ? 'Import from phone' : 'Import from phone (app only)'}
              onPress={() => navigation.navigate('ImportContacts')}
              variant="secondary"
            />
          </View>
        </View>
      </SafeAreaView>
    </AppCanvas>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: layout.maxContentWidth,
    width: '100%',
  },
  filters: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchWrap: {
    alignItems: 'center',
    backgroundColor: homeColors.tileWhite,
    borderColor: '#D5DEE8',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    color: homeColors.ink,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    paddingVertical: 4,
  },
  listContent: {
    gap: spacing.sm,
    paddingBottom: 160,
    paddingHorizontal: spacing.lg,
  },
  row: {
    alignItems: 'center',
    backgroundColor: homeColors.tileWhite,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  rowPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  rowTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  name: {
    ...typography.title,
    color: homeColors.ink,
    flex: 1,
    fontSize: 18,
  },
  notes: {
    ...typography.bodySmall,
    color: homeColors.muted,
  },
  meta: {
    ...typography.caption,
    color: homeColors.muted,
  },
  footer: {
    backgroundColor: homeColors.canvas,
    borderTopColor: '#D5DEE8',
    borderTopWidth: 1,
    bottom: 0,
    gap: spacing.sm,
    left: 0,
    padding: spacing.lg,
    position: 'absolute',
    right: 0,
  },
});
