import * as Contacts from 'expo-contacts';
import { Platform } from 'react-native';

export type DeviceContactRecord = {
  deviceId: string;
  name: string;
  phone: string;
  email: string;
};

export function isPhoneContactImportAvailable(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export function normalizePhone(value: string): string {
  return value.replace(/\D/g, '');
}

function formatContactName(contact: Contacts.Contact): string {
  if (contact.name?.trim()) {
    return contact.name.trim();
  }

  const parts = [contact.firstName, contact.lastName].filter(Boolean);
  return parts.join(' ').trim() || 'Unknown';
}

function mapDeviceContact(contact: Contacts.Contact, index: number): DeviceContactRecord | null {
  const name = formatContactName(contact);
  const phone = contact.phoneNumbers?.[0]?.number?.trim() ?? '';
  const email = contact.emails?.[0]?.email?.trim() ?? '';

  if (!name && !phone && !email) {
    return null;
  }

  return {
    deviceId: `${normalizePhone(phone)}|${email.toLowerCase()}|${name.toLowerCase()}|${index}`,
    name,
    phone,
    email,
  };
}

export async function requestDeviceContactsPermission(): Promise<boolean> {
  const { status } = await Contacts.requestPermissionsAsync();
  return status === 'granted';
}

/** Loads all device contacts. Native iOS/Android only. */
export async function loadDeviceContacts(): Promise<DeviceContactRecord[]> {
  if (!isPhoneContactImportAvailable()) {
    return [];
  }

  const hasPermission = await requestDeviceContactsPermission();
  if (!hasPermission) {
    throw new Error('Contacts permission is required to import from your phone.');
  }

  const pageSize = 500;
  let pageOffset = 0;
  let hasNextPage = true;
  const records: DeviceContactRecord[] = [];
  const seen = new Set<string>();

  while (hasNextPage) {
    const page = await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.Name,
        Contacts.Fields.FirstName,
        Contacts.Fields.LastName,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Emails,
      ],
      pageSize,
      pageOffset,
      sort: Contacts.SortTypes.FirstName,
    });

    for (const [index, contact] of page.data.entries()) {
      const mapped = mapDeviceContact(contact, pageOffset + index);
      if (!mapped || seen.has(mapped.deviceId)) {
        continue;
      }

      seen.add(mapped.deviceId);
      records.push(mapped);
    }

    hasNextPage = page.hasNextPage;
    pageOffset += pageSize;
  }

  return records.sort((left, right) => left.name.localeCompare(right.name));
}

export function filterDeviceContacts(
  contacts: DeviceContactRecord[],
  query: string,
): DeviceContactRecord[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return contacts;
  }

  const digitQuery = normalizePhone(normalizedQuery);

  return contacts.filter((contact) => {
    const haystacks = [
      contact.name.toLowerCase(),
      contact.email.toLowerCase(),
      contact.phone.toLowerCase(),
      normalizePhone(contact.phone),
    ];

    return haystacks.some((value) => {
      if (!value) {
        return false;
      }

      return value.includes(normalizedQuery) || (digitQuery.length > 0 && value.includes(digitQuery));
    });
  });
}

export function filterSavedContacts<T extends { name: string; phone: string; email: string }>(
  contacts: T[],
  query: string,
): T[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return contacts;
  }

  const digitQuery = normalizePhone(normalizedQuery);

  return contacts.filter((contact) => {
    const values = [
      contact.name.toLowerCase(),
      contact.phone.toLowerCase(),
      contact.email.toLowerCase(),
      normalizePhone(contact.phone),
    ];

    return values.some((value) => {
      if (!value) {
        return false;
      }

      return value.includes(normalizedQuery) || (digitQuery.length > 0 && value.includes(digitQuery));
    });
  });
}
