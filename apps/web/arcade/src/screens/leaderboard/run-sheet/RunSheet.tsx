import { useRef } from 'react';
import type { BoardRow } from '@/components/board/BoardParts';
import { RunAvatar } from '@/components/board/RunAvatar';
import { SheetClose } from '@/components/sheet/SheetClose';
import { useSheet } from '@/components/sheet/use-sheet';
import { RunFacts } from './RunFacts';
import './run-sheet.css';

// as wide as the sheet: the whole screen on a phone, else --size-sheet (sheet.css)
const SHEET_POSTER_SIZES = '(max-width: 40rem) 100vw, 36rem';

interface RunSheetProps {
  row: BoardRow | null;
  isOpen: boolean;
  // which board the place is on: this week, or all time
  periodLabel: string;
  onClose: () => void;
}

function Poster({ row }: { row: BoardRow }) {
  return row.poster ? (
    <img
      className="run-sheet__poster"
      id="run-poster"
      key={row.key}
      src={row.poster.previewSrc}
      srcSet={row.poster.srcSet}
      sizes={SHEET_POSTER_SIZES}
      alt={`${row.name}'s run poster`}
      width="1200"
      height="630"
      decoding="async"
    />
  ) : null;
}

// A run of the board, opened from its place or its row: its poster whole, as the game drew it when
// the run was posted, then who played it and what it did.
export function RunSheet({ row, isOpen, periodLabel, onClose }: RunSheetProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useSheet({ dialog, closeButton }, isOpen, onClose);

  return (
    <dialog
      className="sheet run-sheet"
      id="run-sheet"
      aria-labelledby="run-title"
      tabIndex={-1}
      data-poster={row?.poster ? 'yes' : 'no'}
      ref={dialog}
    >
      <SheetClose id="run-close" closeRef={closeButton} />
      {row ? <Poster row={row} /> : null}
      {row ? (
        <div className="sheet__body run-sheet__body">
          <div className="run-sheet__who">
            {row.poster ? null : <RunAvatar row={row} />}
            <div className="run-sheet__heading">
              <h2 className="sheet__title run-sheet__name" id="run-title">
                {row.name}
              </h2>
              <p className="sheet__meta" id="run-place">
                #{row.place} {periodLabel} · {row.dateLabel}
              </p>
            </div>
          </div>
          <RunFacts row={row} />
        </div>
      ) : null}
    </dialog>
  );
}
