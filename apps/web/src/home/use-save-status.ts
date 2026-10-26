import { useEffect, useSyncExternalStore } from 'react';
import type { GameCard } from './game-card';
import { useHome } from './home-context';
import { canSave } from './offline-save.js';

export interface SaveStatus {
  state: 'not-saved' | 'saving' | 'saved' | 'failed';
  percent: number;
}

// A game's save for offline, the same wherever it shows, and null where it cannot be saved or no
// worker answers. Asked once as it first shows, or each time `askAgain` turns true (the details
// sheet opening). A tap saves the game, or, once it is saved, asks before removing it.
export function useSaveStatus(card: GameCard | null, askAgain = false) {
  const { saves, removal } = useHome();
  const id = card && canSave(card) ? card.id : null;
  const status = useSyncExternalStore(saves.subscribe, () =>
    id ? (saves.statusOf(id) as SaveStatus | null) : null,
  );

  useEffect(() => {
    if (id && askAgain) {
      saves.refresh(id);
    } else if (id) {
      saves.look(id);
    }
  }, [id, askAgain, saves]);

  return {
    status,
    tap() {
      if (!card || !id || status?.state === 'saving') {
        return;
      }

      if (status?.state === 'saved') {
        removal.open(card);
      } else {
        saves.save(id);
      }
    },
  };
}

export type SaveControl = ReturnType<typeof useSaveStatus>;
