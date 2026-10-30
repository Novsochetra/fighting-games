import { useState } from 'react';
import type { BoardRow } from '@/components/board/BoardParts';

// The row stays as the sheet closes, so the run does not vanish while it slides away.
export function useRunSheet() {
  const [row, setRow] = useState<BoardRow | null>(null);
  const [isOpen, setOpen] = useState(false);

  return {
    row,
    isOpen,

    open(picked: BoardRow) {
      setRow(picked);
      setOpen(true);
    },

    close: () => setOpen(false),
  };
}
