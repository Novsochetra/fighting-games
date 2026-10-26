import { useRef, useState } from 'react';
import { useArcade } from '../arcade/arcade-context';
import { useSheet } from '../arcade/use-sheet';
import { EVENTS } from './analytics-events.js';
import type { GameCard } from './game-card';

// The sheet with a game's story and controls; its Play takes it down at once, as the card flies.
export function useDetails() {
  const { analytics } = useArcade();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [card, setCard] = useState<GameCard | null>(null);
  const [isOpen, setOpen] = useState(false);
  const sheet = useSheet({ dialog: dialogRef, closeButton: closeRef }, isOpen, () =>
    setOpen(false),
  );

  return {
    card,
    isOpen,
    dialogRef,
    closeRef,
    open(shown: GameCard | undefined) {
      if (!shown) {
        return;
      }

      sheet.finish();
      setCard(shown);
      setOpen(true);
      analytics.track(EVENTS.details, { game_id: shown.id });
    },

    finish() {
      sheet.finish();
      setOpen(false);
    },
  };
}

export type Details = ReturnType<typeof useDetails>;
