import { useMemo } from 'react';

import type { Contact, StudyStatus } from '../../types';

export function useStudies(contacts: Contact[], studyFilter: 'all' | StudyStatus = 'all') {
  const faithfulContacts = useMemo(
    () => contacts.filter((contact) => contact.status === 'faithful'),
    [contacts],
  );

  const filteredContacts = useMemo(() => {
    if (studyFilter === 'all') {
      return faithfulContacts;
    }

    return faithfulContacts.filter((contact) => contact.studyStatus === studyFilter);
  }, [faithfulContacts, studyFilter]);

  const counts = useMemo(
    () =>
      faithfulContacts.reduce(
        (totals, contact) => {
          totals.all += 1;
          totals[contact.studyStatus] += 1;
          return totals;
        },
        {
          all: 0,
          none: 0,
          progressing: 0,
          paused: 0,
          stopped: 0,
          finished: 0,
        } satisfies Record<'all' | StudyStatus, number>,
      ),
    [faithfulContacts],
  );

  return { faithfulContacts, filteredContacts, counts };
}
