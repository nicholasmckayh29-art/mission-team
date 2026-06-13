import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { StudiesStackParamList } from '../navigation/types';
import { setStudyStatus } from '../services/contacts';
import { AppCanvas } from '../shared/components/AppCanvas';
import { Avatar } from '../shared/components/Avatar';
import { Chip } from '../shared/components/Chip';
import { EmptyState } from '../shared/components/EmptyState';
import { StudyBadge } from '../shared/components/StudyBadge';
import { StudyStatusPicker } from '../shared/components/StudyStatusPicker';
import { TabScreenHeader } from '../shared/components/TabScreenHeader';
import { useContacts } from '../shared/hooks/useContacts';
import { useStudies } from '../shared/hooks/useStudies';
import { fonts, layout, radius, spacing, typography } from '../theme';
import { homeColors, tabAccents } from '../theme/home';
import type { Contact, StudyStatus } from '../types';
import { STUDY_STATUS_FILTER_LABELS } from '../types';

type Props = NativeStackScreenProps<StudiesStackParamList, 'Studies'>;

const ACCENT = tabAccents.studies;

const FILTERS: Array<{ key: 'all' | StudyStatus; label: string }> = [
  { key: 'all', label: STUDY_STATUS_FILTER_LABELS.all },
  { key: 'progressing', label: STUDY_STATUS_FILTER_LABELS.progressing },
  { key: 'paused', label: STUDY_STATUS_FILTER_LABELS.paused },
  { key: 'stopped', label: STUDY_STATUS_FILTER_LABELS.stopped },
  { key: 'finished', label: STUDY_STATUS_FILTER_LABELS.finished },
];

export function StudiesScreen({ navigation }: Props) {
  const { contacts } = useContacts();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all');
  const [expandedContactId, setExpandedContactId] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<StudyStatus | null>(null);
  const { filteredContacts, counts } = useStudies(contacts, filter);

  async function handleStatusChange(contact: Contact, status: StudyStatus) {
    setLoadingStatus(status);

    try {
      await setStudyStatus(contact, status);
      setExpandedContactId(contact.id);
    } finally {
      setLoadingStatus(null);
    }
  }

  return (
    <AppCanvas style={styles.flex}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <TabScreenHeader
            accent={ACCENT}
            eyebrow="Discipleship"
            subtitle={`${counts.all} disciples · tap a friend to update their study status`}
            title="Faithful friends"
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

          <FlatList
            contentContainerStyle={styles.listContent}
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <EmptyState
                actionLabel="View contacts"
                body="Mark a contact as faithful when they are open to studying the Bible. Track whether studies are in progress, paused, abandoned, or completed."
                onAction={() => navigation.getParent()?.navigate('ContactsTab')}
                title="No disciples in study yet"
              />
            }
            renderItem={({ item }) => {
              const isExpanded = expandedContactId === item.id;

              return (
                <View style={styles.rowWrap}>
                  <Pressable
                    onPress={() =>
                      setExpandedContactId((current) => (current === item.id ? null : item.id))
                    }
                    style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                  >
                    <Avatar accent={ACCENT} name={item.name} />
                    <View style={styles.rowBody}>
                      <Text numberOfLines={1} style={styles.name}>
                        {item.name}
                      </Text>
                      {item.notes ? (
                        <Text numberOfLines={2} style={styles.notes}>
                          {item.notes}
                        </Text>
                      ) : null}
                    </View>
                    <StudyBadge compact status={item.studyStatus} />
                  </Pressable>

                  {isExpanded ? (
                    <View style={styles.pickerWrap}>
                      <StudyStatusPicker
                        compact
                        loadingStatus={loadingStatus}
                        onSelect={(status) => handleStatusChange(item, status)}
                        selected={item.studyStatus}
                      />
                      <Pressable onPress={() => navigation.navigate('StudyDetail', { contactId: item.id })}>
                        <Text style={styles.detailLink}>Open full study record</Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              );
            }}
            showsVerticalScrollIndicator={false}
          />
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
  listContent: {
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  rowWrap: {
    gap: spacing.sm,
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
  name: {
    ...typography.title,
    color: homeColors.ink,
    fontSize: 18,
  },
  notes: {
    ...typography.bodySmall,
    color: homeColors.muted,
  },
  pickerWrap: {
    backgroundColor: homeColors.tileWhite,
    borderColor: '#D5DEE8',
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  detailLink: {
    ...typography.caption,
    color: tabAccents.studies,
    fontFamily: fonts.extraBold,
    textAlign: 'center',
  },
});
