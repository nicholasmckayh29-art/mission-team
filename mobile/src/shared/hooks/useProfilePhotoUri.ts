import { useEffect, useState } from 'react';

import { useAuth } from '../../providers/AuthProvider';
import { resolveProfilePhotoUri } from '../../services/profilePhoto';

export function useProfilePhotoUri(fallbackUri?: string) {
  const { user, profile } = useAuth();
  const [uri, setUri] = useState<string | null>(fallbackUri ?? profile?.photoURL ?? null);

  useEffect(() => {
    let cancelled = false;

    async function loadPhoto() {
      const resolved = await resolveProfilePhotoUri(profile?.photoURL, user?.uid);
      if (!cancelled) {
        setUri(resolved);
      }
    }

    void loadPhoto();

    return () => {
      cancelled = true;
    };
  }, [profile?.photoURL, user?.uid]);

  return uri;
}
