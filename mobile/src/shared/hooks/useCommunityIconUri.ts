import { useEffect, useState } from 'react';

import { resolveCommunityIconUri } from '../../services/communityIcon';

export function useCommunityIconUri(communityId: string | undefined, imageUrl: string | undefined) {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadIcon() {
      const resolved = await resolveCommunityIconUri(imageUrl, communityId);
      if (!cancelled) {
        setUri(resolved);
      }
    }

    void loadIcon();

    return () => {
      cancelled = true;
    };
  }, [communityId, imageUrl]);

  return uri;
}
