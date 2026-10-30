import { useRef } from 'react';
import type { BoardRow } from '@/components/board/BoardParts';
import { SheetClose } from '@/components/sheet/SheetClose';
import { useSheet } from '@/components/sheet/use-sheet';
import './poster-sheet.css';

// as wide as the sheet: the whole screen on a phone, else --size-sheet (sheet.css)
const SHEET_POSTER_SIZES = '(max-width: 40rem) 100vw, 36rem';

interface PosterSheetProps {
  row: BoardRow | null;
  isOpen: boolean;
  onClose: () => void;
}

const describeRun = (row: BoardRow) =>
  [`#${row.place}`, `${row.scoreLabel} points`, row.reachedLabel, row.dateLabel].join(' · ');

// A run's whole poster, as the game drew it when the run was posted. The row stays as the sheet
// closes, so its poster does not vanish while it slides away.
export function PosterSheet({ row, isOpen, onClose }: PosterSheetProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useSheet({ dialog, closeButton }, isOpen, onClose);

  return (
    <dialog
      className="sheet poster-sheet"
      id="poster-sheet"
      aria-labelledby="poster-title"
      tabIndex={-1}
      ref={dialog}
    >
      <SheetClose id="poster-close" closeRef={closeButton} />
      {row?.poster ? (
        <img
          className="poster-sheet__image"
          id="poster-image"
          key={row.key}
          src={row.poster.src}
          srcSet={row.poster.srcSet}
          sizes={SHEET_POSTER_SIZES}
          alt={`${row.name}'s run as ${row.heroName || 'their hero'}, ${row.scoreLabel} points`}
          width="1200"
          height="630"
          decoding="async"
        />
      ) : null}
      <div className="sheet__body">
        <h2 className="sheet__title" id="poster-title">
          {row?.name ?? ''}
        </h2>
        <p className="sheet__description" id="poster-description">
          {row ? describeRun(row) : ''}
        </p>
      </div>
    </dialog>
  );
}
