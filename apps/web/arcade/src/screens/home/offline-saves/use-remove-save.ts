import { useRef, useState } from 'react';
import { useSheet } from '@/components/sheet/use-sheet';
import type { GameCard } from '@/api/catalog/game-card';

// The small sheet that asks before a saved game is removed; its Cancel closes it as a sheet's
// close button does.
export function useRemoveSave() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [card, setCard] = useState<GameCard | null>(null);
  const [isOpen, setOpen] = useState(false);
  const sheet = useSheet({ dialog: dialogRef, closeButton: cancelRef }, isOpen, () =>
    setOpen(false),
  );

  return {
    card,
    isOpen,
    dialogRef,
    cancelRef,
    open(shown: GameCard) {
      sheet.finish();
      setCard(shown);
      setOpen(true);
    },

    finish() {
      sheet.finish();
      setOpen(false);
    },
  };
}

export type RemoveSave = ReturnType<typeof useRemoveSave>;
