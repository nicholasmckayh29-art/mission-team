import { useEffect, useState } from 'react';

import { useAuth } from '../../providers/AuthProvider';
import { subscribeCommunityMemberships } from '../../services/communities';
import type { CommunityMembership } from '../../types';

export function useCommunities() {
  const { user, loading: authLoading } = useAuth();
  const [memberships, setMemberships] = useState<CommunityMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setMemberships([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeCommunityMemberships(
      (nextMemberships) => {
        setMemberships(nextMemberships);
        setLoading(false);
        setError(null);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [authLoading, user]);

  return { memberships, loading: authLoading || loading, error };
}
