import { useState, useSyncExternalStore } from 'react';
import { useArcade } from '@/services/arcade-context';
import { useRootClass } from '@/hooks/use-root-class';

// Once a newer build is all in (update-check.js), the banner offers to reload into it; the root's
// class keeps the other banners out of its place and lifts the hero's buttons above it.
export function useUpdate() {
  const { updates, reload, sound } = useArcade();
  const isReady = useSyncExternalStore(updates.subscribe, updates.isReady);
  const [isDismissed, setDismissed] = useState(false);
  const shown = isReady && !isDismissed;

  useRootClass('has-update-banner', shown);

  return {
    shown,
    reload: () => reload(),
    notNow() {
      setDismissed(true);
      sound.play('sheetClose');
    },
  };
}
