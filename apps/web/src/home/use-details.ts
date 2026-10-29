import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useArcade } from '../arcade/arcade-context';
import { useSheet } from '../arcade/use-sheet';
import { EVENTS } from './analytics-events.js';
import type { GameCard } from './game-card';

export type TrailerSource = 'hero' | 'details';

interface Shown {
  card: GameCard | null;
  isOpen: boolean;
  isWatching: boolean;
}

// The sheet with a game's story and controls; its Play takes it down at once, as the card flies. Its
// art turns into the game's trailer, which leaves with the sheet.
export function useDetails() {
  const { analytics } = useArcade();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [shown, setShown] = useState<Shown>({ card: null, isOpen: false, isWatching: false });
  const closed = () => setShown((was) => ({ ...was, isOpen: false, isWatching: false }));
  const sheet = useSheet({ dialog: dialogRef, closeButton: closeRef }, shown.isOpen, closed);
  const show = (card: GameCard, isWatching: boolean) => {
    sheet.finish();
    setShown({ card, isOpen: true, isWatching });
  };

  return {
    ...shown,
    dialogRef,
    closeRef,
    open(card: GameCard | undefined) {
      if (!card) {
        return;
      }

      show(card, false);
      analytics.track(EVENTS.details, { game_id: card.id });
    },

    // drawn before the tap ends, so the trailer starts in it (trailer-player.js); the sheet already
    // up only swaps its art for the trailer
    watch(card: GameCard, source: TrailerSource) {
      if (!card.trailerSrc) {
        return;
      }

      flushSync(() => (shown.isOpen ? setShown({ ...shown, isWatching: true }) : show(card, true)));
      analytics.track(EVENTS.trailer, { game_id: card.id, source });
    },

    finish() {
      sheet.finish();
      closed();
    },
  };
}

export type Details = ReturnType<typeof useDetails>;
