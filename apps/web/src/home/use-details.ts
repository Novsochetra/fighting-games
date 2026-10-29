import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useArcade } from '../arcade/arcade-context';
import { useSheet } from '../arcade/use-sheet';
import { EVENTS } from './analytics-events.js';
import type { GameCard } from './game-card';

interface Shown {
  card: GameCard | null;
  isOpen: boolean;
  isWatching: boolean;
}

// The sheet with a game's story and controls; its Play takes it down at once, as the card flies.
export function useDetails() {
  const { analytics } = useArcade();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [shown, setShown] = useState<Shown>({ card: null, isOpen: false, isWatching: false });
  const closed = () => setShown((was) => ({ ...was, isOpen: false, isWatching: false }));
  const sheet = useSheet({ dialog: dialogRef, closeButton: closeRef }, shown.isOpen, closed);

  return {
    ...shown,
    dialogRef,
    closeRef,
    open(card: GameCard | undefined) {
      if (!card) {
        return;
      }

      sheet.finish();
      setShown({ card, isOpen: true, isWatching: false });
      analytics.track(EVENTS.details, { game_id: card.id });
    },

    // drawn before the tap ends, so the trailer starts inside it, the only time a browser allows sound
    watch() {
      const { card } = shown;

      if (!card?.trailerSrc) {
        return;
      }

      flushSync(() => setShown({ ...shown, isWatching: true }));
      analytics.track(EVENTS.trailer, { game_id: card.id });
    },

    finish() {
      sheet.finish();
      closed();
    },
  };
}

export type Details = ReturnType<typeof useDetails>;
