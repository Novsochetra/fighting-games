import { useEffect, useState } from 'react';
import { useArcade, useArcadeUrl } from '@/services/arcade-context';
import { saveAddress } from '@/api/offline/offline-save.js';
import { createSaveStore } from '@/api/offline/offline-saves.js';
import { usePageShow } from '@/hooks/use-page-show';
import { useWorkerTakeover } from '@/hooks/use-worker-takeover';

// The home screen's one store of every game's save for offline. Back from a game, the arcade asks
// again: a play saves the game behind it too. It asks again as the worker takes the page over too,
// since the arcade's first page asks before the worker is there to answer.
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
  useWorkerTakeover(store.refreshAll);

  return store;
}

export type OfflineSaves = ReturnType<typeof useOfflineSaves>;
