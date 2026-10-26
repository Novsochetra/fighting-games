import { useEffect, useState } from 'react';
import { useArcade, useArcadeUrl } from '../arcade/arcade-context';
import { saveAddress } from './offline-save.js';
import { createSaveStore } from './offline-saves.js';
import { usePageShow } from './use-page-show';

// The home screen's one store of every game's save for offline. Back from a game, the arcade asks
// again: a play saves the game behind it too.
export function useOfflineSaves() {
  const { fetch } = useArcade();
  const url = useArcadeUrl();
  const [store] = useState(() =>
    createSaveStore({
      fetch,
      addressOf: (id: string) => url(saveAddress(id)),
      setTimer: (callback: () => void, ms: number) => setTimeout(callback, ms),
      clearTimer: (timer: ReturnType<typeof setTimeout> | null) => clearTimeout(timer ?? undefined),
    }),
  );

  useEffect(() => {
    store.start();

    return store.stop;
  }, [store]);

  usePageShow(store.refreshAll);

  return store;
}

export type OfflineSaves = ReturnType<typeof useOfflineSaves>;
