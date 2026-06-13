import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import type { ContactsStackParamList } from '../navigation/types';
import {
  deleteContact,
  markContactFollowedUp,
  setContactStatus,
  setStudyStatus,
  subscribeContacts,
} from '../services/contacts';
import { Avatar } from '../shared/components/Avatar';
import { Button } from '../shared/components/Button';
import { Card } from '../shared/components/Card';
import { StatusBadge } from '../shared/components/StatusBadge';
import { StudyBadge } from '../shared/components/StudyBadge';
import { StudyStatusPicker } from '../shared/components/StudyStatusPicker';
import { Screen } from '../shared/components/Screen';
import { colors, fonts, spacing, typography } from '../theme';
import { tabAccents } from '../theme/home';
import type { Contact, StudyStatus } from '../types';
import { STUDY_STATUS_LABELS } from '../types';

type Props = NativeStackScreenProps<ContactsStackParamList, 'ContactDetail'>;

export function ContactDetailScreen({ navigation, route }: Props) {
  const { contactId } = route.params;
  const [contact, setContact] = useState<Contact | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [loadingStudyStatus, setLoadingStudyStatus] = useState<StudyStatus | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeContacts((contacts) => {
      setContact(contacts.find((item) => item.id === contactId) ?? null);
    });

    return unsubscribe;
  }, [contactId]);

  async function runAction(actionKey: string, action: () => Promise<void>) {
    setLoadingAction(actionKey);
    setError('');

    try {
      await action();
    } catch (actionError) {
      const message = actionError instanceof Error ? actionError.message : 'Action failed.';
      setError(message);
    } finally {
      setLoadingAction(null);
    }
  }

  function confirmDelete() {
    if (!contact) {
      return;
    }

    Alert.alert('Delete contact', `Remove ${contact.name} from your list?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void runAction('delete', async () => {
            await deleteContact(contact.id);
            navigation.goBack();
          });
        },
      },
    ]);
  }

  async function handleStudyStatus(status: StudyStatus) {
    if (!contact) {
      return;
    }

    setLoadingStudyStatus(status);
    setError('');

    try {
      await setStudyStatus(contact, status);
    } catch (actionError) {
      const message = actionError instanceof Error ? actionError.message : 'Action failed.';
      setError(message);
    } finally {
      setLoadingStudyStatus(null);
    }
  }

  if (!contact) {
    return (
      <Screen accent={tabAccents.contacts} showBrand={false} subtitle="Loading contact details..." title="Contact">
        <Text style={styles.loading}>Loading...</Text>
      </Screen>
    );
  }

  return (
    <Screen
      accent={tabAccents.contacts}
      showBrand={false}
      subtitle="Update status or log your latest interaction."
      title={contact.name}
      footer={
        <>
          <Button
            label="Mark followed up"
            loading={loadingAction === 'followed_up'}
            onPress={() => runAction('followed_up', () => markContactFollowedUp(contact))}
          />
          <Button
            label="Mark faithful"
            loading={loadingAction === 'faithful'}
            onPress={() => runAction('faithful', () => setContactStatus(contact, 'faithful'))}
            variant="secondary"
          />
          <Button
            label="Move to backburner"
            loading={loadingAction === 'backburner'}
            onPress={() =>
              runAction('backburner', () =>
                setContactStatus(
                  contact,
                  'backburner',
                  contact.status === 'faithful' ? 'stopped' : undefined,
                ),
              )
            }
            variant="secondary"
          />
          <Button
            label="Edit contact"
            onPress={() => navigation.navigate('ContactForm', { contactId })}
            variant="ghost"
          />
          <Button
            label="Delete contact"
            loading={loadingAction === 'delete'}
            onPress={confirmDelete}
            variant="danger"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </>
      }
    >
      <View style={styles.profileRow}>
        <Avatar name={contact.name} size={56} />
        <View style={styles.badges}>
          <StatusBadge status={contact.status} />
          {contact.status === 'faithful' ? <StudyBadge status={contact.studyStatus} /> : null}
        </View>
      </View>

      {contact.status === 'faithful' ? (
        <Card subtitle="Track discipleship progress for this faithful friend." title="Study status">
          <StudyStatusPicker
            loadingStatus={loadingStudyStatus}
            onSelect={handleStudyStatus}
            selected={contact.studyStatus}
          />
        </Card>
      ) : null}

      <Card title="Details">
        {contact.phone ? <DetailRow label="Phone" value={contact.phone} /> : null}
        {contact.email ? <DetailRow label="Email" value={contact.email} /> : null}
        {contact.notes ? <DetailRow label="Notes" value={contact.notes} /> : null}
        {contact.status === 'faithful' ? (
          <DetailRow label="Study status" value={STUDY_STATUS_LABELS[contact.studyStatus]} />
        ) : null}
        <DetailRow label="Strike count" value={String(contact.strikeCount)} />
        {contact.nextReminderAt && contact.status === 'follow_up' ? (
          <DetailRow
            label="Next reminder"
            value={contact.nextReminderAt.toDate().toLocaleString()}
          />
        ) : null}
      </Card>
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  badges: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  detailRow: {
    gap: 2,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSubtle,
    fontFamily: fonts.bold,
  },
  detailValue: {
    ...typography.bodySmall,
    color: colors.text,
  },
  loading: {
    ...typography.body,
    color: colors.textSubtle,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
  },
});
