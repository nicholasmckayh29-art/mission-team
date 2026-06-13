import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import type { ContactsStackParamList } from '../navigation/types';
import { createContact, subscribeContacts, updateContact } from '../services/contacts';
import { Button } from '../shared/components/Button';
import { Card } from '../shared/components/Card';
import { Screen, TextField } from '../shared/components/Screen';
import { colors, typography } from '../theme';
import { tabAccents } from '../theme/home';
import type { Contact } from '../types';

type Props = NativeStackScreenProps<ContactsStackParamList, 'ContactForm'>;

export function ContactFormScreen({ navigation, route }: Props) {
  const contactId = route.params?.contactId;
  const [existingContact, setExistingContact] = useState<Contact | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!contactId) {
      return;
    }

    const unsubscribe = subscribeContacts((contacts) => {
      const match = contacts.find((contact) => contact.id === contactId) ?? null;
      setExistingContact(match);

      if (match) {
        setName(match.name);
        setPhone(match.phone);
        setEmail(match.email);
        setNotes(match.notes);
      }
    });

    return unsubscribe;
  }, [contactId]);

  async function handleSave() {
    setError('');

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    setLoading(true);

    try {
      if (contactId) {
        await updateContact(contactId, {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          notes: notes.trim(),
        });
      } else {
        await createContact({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          notes: notes.trim(),
        });
      }

      navigation.goBack();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Could not save contact.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen
      accent={tabAccents.contacts}
      showBrand={false}
      subtitle={
        contactId
          ? 'Update contact details and notes.'
          : 'New contacts start in follow-up status with a reminder in two days.'
      }
      title={contactId ? 'Edit contact' : 'New contact'}
      footer={
        <>
          <Button label="Save contact" loading={loading} onPress={handleSave} />
          {!contactId ? (
            <Button
              label="Import from phone"
              onPress={() => navigation.navigate('ImportContacts')}
              variant="secondary"
            />
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </>
      }
    >
      <Card>
        <TextField autoCapitalize="words" label="Name" onChangeText={setName} value={name} />
        <TextField
          autoCapitalize="none"
          keyboardType="phone-pad"
          label="Phone"
          onChangeText={setPhone}
          value={phone}
        />
        <TextField
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          value={email}
        />
        <TextField
          label="Notes"
          multiline
          numberOfLines={4}
          onChangeText={setNotes}
          style={styles.notesInput}
          value={notes}
        />
        {existingContact ? (
          <Text style={styles.meta}>
            Status: {existingContact.status.replace('_', ' ')} · Strikes:{' '}
            {existingContact.strikeCount}
          </Text>
        ) : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  notesInput: {
    minHeight: 110,
    textAlignVertical: 'top',
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
