import { useEffect, useState } from 'react';

import { subscribeContacts } from '../../services/contacts';
import type { Contact, ContactStatus } from '../../types';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeContacts((nextContacts) => {
      setContacts(nextContacts);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { contacts, loading };
}

export function countContactsByStatus(contacts: Contact[]) {
  return contacts.reduce(
    (counts, contact) => {
      counts[contact.status] += 1;
      counts.all += 1;
      return counts;
    },
    {
      all: 0,
      follow_up: 0,
      faithful: 0,
      forgotten: 0,
      backburner: 0,
    } satisfies Record<'all' | ContactStatus, number>,
  );
}
