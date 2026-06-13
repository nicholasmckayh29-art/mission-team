import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { ContactsStackParamList } from '../navigation/types';
import { createContactsBulk } from '../services/contacts';
import {
  filterDeviceContacts,
  isPhoneContactImportAvailable,
  loadDeviceContacts,
  type DeviceContactRecord,
} from '../services/deviceContacts';
import { Button } from '../shared/components/Button';
import { EmptyState } from '../shared/components/EmptyState';
import { Screen } from '../shared/components/Screen';
import { colors, fonts, radius, spacing, typography } from '../theme';
import { homeColors, tabAccents } from '../theme/home';

type Props = NativeStackScreenProps<ContactsStackParamList, 'ImportContacts'>;

export function ImportContactsScreen({ navigation }: Props) {
  const nativeImportAvailable = isPhoneContactImportAvailable();
  const [loadingDeviceContacts, setLoadingDeviceContacts] = useState(nativeImportAvailable);
  const [importing, setImporting] = useState(false);
  const [deviceContacts, setDeviceContacts] = useState<DeviceContactRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    if (!nativeImportAvailable) {
      return;
    }

    async function fetchContacts() {
      setLoadingDeviceContacts(true);
      setError('');

      try {
        const records = await loadDeviceContacts();
        setDeviceContacts(records);
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : 'Could not load phone contacts.';
        setError(message);
      } finally {
        setLoadingDeviceContacts(false);
      }
    }

    void fetchContacts();
  }, [nativeImportAvailable]);

  const filteredContacts = useMemo(
    () => filterDeviceContacts(deviceContacts, searchQuery),
    [deviceContacts, searchQuery],
  );

  const allVisibleSelected =
    filteredContacts.length > 0 &&
    filteredContacts.every((contact) => selectedIds.has(contact.deviceId));

  function toggleContact(deviceId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(deviceId)) {
        next.delete(deviceId);
      } else {
        next.add(deviceId);
      }

      return next;
    });
  }

  function toggleSelectAllVisible() {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (allVisibleSelected) {
        filteredContacts.forEach((contact) => next.delete(contact.deviceId));
      } else {
        filteredContacts.forEach((contact) => next.add(contact.deviceId));
      }

      return next;
    });
  }

  async function handleImport() {
    const selectedContacts = deviceContacts.filter((contact) => selectedIds.has(contact.deviceId));
    if (selectedContacts.length === 0) {
      setError('Select at least one contact to import.');
      return;
    }

    setImporting(true);
    setError('');

    try {
      const result = await createContactsBulk(
        selectedContacts.map((contact) => ({
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          notes: '',
        })),
      );

      Alert.alert(
        'Import complete',
        `Imported ${result.imported} contact${result.imported === 1 ? '' : 's'}${
          result.skipped > 0
            ? `. Skipped ${result.skipped} duplicate${result.skipped === 1 ? '' : 's'}.`
            : '.'
        }`,
      );
      setSelectedIds(new Set());
      navigation.goBack();
    } catch (importError) {
      const message =
        importError instanceof Error ? importError.message : 'Could not import contacts.';
      setError(message);
    } finally {
      setImporting(false);
    }
  }

  if (!nativeImportAvailable) {
    return (
      <Screen
        accent={tabAccents.contacts}
        showBrand={false}
        subtitle="Bulk phone import is built for the iOS and Android apps."
        title="Import from phone"
      >
        <EmptyState
          body="Expo Go on iPhone/Android or a dev build can read your phone contacts. Search, select in bulk, and import only the people you choose for follow-up."
          title="Available in the mobile app"
        />
        <Button label="Add contact manually" onPress={() => navigation.navigate('ContactForm')} />
      </Screen>
    );
  }

  return (
    <Screen
      accent={tabAccents.contacts}
      scroll={false}
      showBrand={false}
      subtitle={`${deviceContacts.length.toLocaleString()} on this device · search and select who to import`}
      title="Import from phone"
      footer={
        <>
          <Button
            disabled={selectedIds.size === 0 || importing}
            label={
              selectedIds.size > 0
                ? `Import ${selectedIds.size} contact${selectedIds.size === 1 ? '' : 's'}`
                : 'Import selected'
            }
            loading={importing}
            onPress={handleImport}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </>
      }
    >
      <View style={styles.searchWrap}>
        <Ionicons color={colors.textSubtle} name="search-outline" size={18} />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          onChangeText={setSearchQuery}
          placeholder="Search name, phone, or email"
          placeholderTextColor={colors.textSubtle}
          style={styles.searchInput}
          value={searchQuery}
        />
      </View>

      <View style={styles.toolbar}>
        <Text style={styles.toolbarLabel}>
          {filteredContacts.length.toLocaleString()} shown · {selectedIds.size.toLocaleString()} selected
        </Text>
        <Pressable onPress={toggleSelectAllVisible}>
          <Text style={styles.toolbarAction}>
            {allVisibleSelected ? 'Clear visible' : 'Select visible'}
          </Text>
        </Pressable>
      </View>

      {loadingDeviceContacts ? (
        <View style={styles.loadingBlock}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Reading phone contacts...</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={filteredContacts}
          keyExtractor={(item) => item.deviceId}
          ListEmptyComponent={
            <EmptyState
              body={
                deviceContacts.length === 0
                  ? 'No contacts were found on this device.'
                  : 'Try a different name, number, or email.'
              }
              title={deviceContacts.length === 0 ? 'Nothing to import' : 'No matches'}
            />
          }
          renderItem={({ item }) => {
            const selected = selectedIds.has(item.deviceId);

            return (
              <Pressable
                onPress={() => toggleContact(item.deviceId)}
                style={({ pressed }) => [
                  styles.row,
                  selected && styles.rowSelected,
                  pressed && styles.rowPressed,
                ]}
              >
                <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                  {selected ? <Ionicons color={colors.white} name="checkmark" size={14} /> : null}
                </View>
                <View style={styles.rowBody}>
                  <Text numberOfLines={1} style={styles.name}>
                    {item.name}
                  </Text>
                  <Text numberOfLines={1} style={styles.meta}>
                    {[item.phone, item.email].filter(Boolean).join(' · ') || 'No phone or email'}
                  </Text>
                </View>
              </Pressable>
            );
          }}
          showsVerticalScrollIndicator={false}
          style={styles.list}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    paddingVertical: 4,
  },
  toolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  toolbarLabel: {
    ...typography.caption,
    color: colors.textSubtle,
    fontFamily: fonts.semibold,
  },
  toolbarAction: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  loadingBlock: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  row: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  rowSelected: {
    backgroundColor: homeColors.feedFaith,
    borderColor: homeColors.tileBlue,
  },
  rowPressed: {
    opacity: 0.94,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.borderStrong,
    borderRadius: 8,
    borderWidth: 1.5,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  checkboxSelected: {
    backgroundColor: homeColors.tileBlue,
    borderColor: homeColors.tileBlue,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.bodySmall,
    color: colors.text,
    fontFamily: fonts.semibold,
  },
  meta: {
    ...typography.caption,
    color: colors.textSubtle,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
  },
});
