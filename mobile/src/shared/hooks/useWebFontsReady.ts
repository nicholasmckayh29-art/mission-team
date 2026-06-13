import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export function useWebFontsReady(enabled: boolean): boolean {
  const [ready, setReady] = useState(Platform.OS !== 'web');

  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled) {
      return;
    }

    let cancelled = false;

    void document.fonts.ready.then(() => {
      if (!cancelled) {
        setReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return ready;
}
