import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { StudiesStackParamList } from '../navigation/types';
import {
  setContactStatus,
  setStudyStatus,
  subscribeContacts,
} from '../services/contacts';
import { Avatar } from '../shared/components/Avatar';
import { Button } from '../shared/components/Button';
import { Card } from '../shared/components/Card';
import { Screen } from '../shared/components/Screen';
import { StatusBadge } from '../shared/components/StatusBadge';
import { StudyBadge } from '../shared/components/StudyBadge';
import { StudyStatusPicker } from '../shared/components/StudyStatusPicker';
import { colors, fonts, spacing, typography } from '../theme';
import { tabAccents } from '../theme/home';
import type { Contact, StudyStatus } from '../types';
import { STUDY_STATUS_LABELS } from '../types';

type Props = NativeStackScreenProps<StudiesStackParamList, 'StudyDetail'>;

export function StudyDetailScreen({ navigation, route }: Props) {
  const { contactId } = route.params;
  const [contact, setContact] = useState<Contact | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<StudyStatus | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeContacts((contacts) => {
      setContact(contacts.find((item) => item.id === contactId) ?? null);
    });

    return unsubscribe;
  }, [contactId]);

  async function handleStudyStatus(status: StudyStatus) {
    if (!contact) {
      return;
    }

    setLoadingStatus(status);
    setError('');

    try {
      await setStudyStatus(contact, status);
    } catch (actionError) {
      const message = actionError instanceof Error ? actionError.message : 'Action failed.';
      setError(message);
    } finally {
      setLoadingStatus(null);
    }
  }

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

  if (!contact) {
    return (
      <Screen accent={tabAccents.studies} showBrand={false} subtitle="Loading study details..." title="Study">
        <Text style={styles.loading}>Loading...</Text>
      </Screen>
    );
  }

  if (contact.status !== 'faithful') {
    return (
      <Screen
        accent={tabAccents.studies}
        showBrand={false}
        subtitle="This contact is no longer marked faithful."
        title={contact.name}
        footer={
          <Button label="Back to studies" onPress={() => navigation.goBack()} variant="secondary" />
        }
      >
        <Text style={styles.loading}>Study tracking is only available for faithful friends.</Text>
      </Screen>
    );
  }

  return (
    <Screen
      accent={tabAccents.studies}
      showBrand={false}
      subtitle="Guide this disciple toward maturity in Christ."
      title={contact.name}
      footer={
        <>
          <Button
            label="Move to backburner"
            loading={loadingAction === 'backburner'}
            onPress={() =>
              runAction('backburner', () => setContactStatus(contact, 'backburner', 'stopped'))
            }
            variant="ghost"
          />
          <Button
            label="Open full contact"
            onPress={() =>
              navigation.getParent()?.navigate('ContactsTab', {
                screen: 'ContactDetail',
                params: { contactId },
              })
            }
            variant="ghost"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </>
      }
    >
      <View style={styles.profileRow}>
        <Avatar name={contact.name} size={56} />
        <View style={styles.badges}>
          <StatusBadge status={contact.status} />
          <StudyBadge status={contact.studyStatus} />
        </View>
      </View>

      <Card title="Update study status">
        <StudyStatusPicker
          loadingStatus={loadingStatus}
          onSelect={handleStudyStatus}
          selected={contact.studyStatus}
        />
        <Text style={styles.currentStatus}>
          Current: {STUDY_STATUS_LABELS[contact.studyStatus]}
        </Text>
      </Card>

      <Card title="Study notes">
        <Text style={styles.body}>
          {contact.notes.trim() ? contact.notes : 'No notes yet. Add notes from the contact screen.'}
        </Text>
      </Card>

      <Card title="Contact info">
        {contact.phone ? <DetailRow label="Phone" value={contact.phone} /> : null}
        {contact.email ? <DetailRow label="Email" value={contact.email} /> : null}
        {contact.lastInteractionAt ? (
          <DetailRow
            label="Last interaction"
            value={contact.lastInteractionAt.toDate().toLocaleString()}
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
  currentStatus: {
    ...typography.caption,
    color: colors.textSubtle,
    marginTop: spacing.xs,
  },
  body: {
    ...typography.bodySmall,
    color: colors.textMuted,
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
