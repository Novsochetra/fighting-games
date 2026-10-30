import { useState } from 'react';
import type { BoardRow } from '@/components/board/BoardParts';

export function usePosterSheet() {
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
