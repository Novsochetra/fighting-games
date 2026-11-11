import { useRef, useState } from 'react';
import { useArcade } from '@/services/arcade-context';
import { Segmented } from '@/components/segmented/Segmented';
import { SheetClose } from '@/components/sheet/SheetClose';
import { useSheet } from '@/components/sheet/use-sheet';
import { firstShape } from './wallpaper-list.js';
import { WallpaperHeading } from './WallpaperHeading';
import { WallpaperPreview } from './WallpaperPreview';
import type { WallpaperStats } from './use-wallpaper-stats';
import { WallpaperSave } from './WallpaperSave';
import type { Shape, WallpaperCard } from './wallpaper-types';
import './wallpaper-sheet.css';

const SHAPES = [
  { value: 'phone', label: 'Phone' },
  { value: 'desktop', label: 'Computer' },
] as const;

interface SheetProps {
  card: WallpaperCard | null;
  stats: WallpaperStats;
  isOpen: boolean;
  onClose: () => void;
}

// A wallpaper opened from the grid: how it looks on a phone or a computer, and its download.
export function WallpaperSheet({ card, stats, isOpen, onClose }: SheetProps) {
  const { window, sound } = useArcade();
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [shape, setShape] = useState<Shape>(() => firstShape(window));

  useSheet({ dialog, closeButton }, isOpen, onClose);

  // The close button comes after the preview, whose stacked pictures would paint over it.
  return (
    <dialog
      className="sheet wallpaper-sheet"
      id="wallpaper-sheet"
      aria-labelledby="wallpaper-title"
      tabIndex={-1}
      ref={dialog}
    >
      {card ? <WallpaperPreview key={card.id} card={card} shape={shape} /> : null}
      <SheetClose id="wallpaper-close" closeRef={closeButton} />
      {card ? (
        <div className="sheet__body wallpaper-sheet__body">
          <WallpaperHeading card={card} stats={stats} />
          <Segmented
            id="wallpaper-shape"
            label="Wallpaper for"
            options={SHAPES}
            value={shape}
            onChange={(next) => {
              setShape(next);
              sound.play('switch');
            }}
          />
          <WallpaperSave
            card={card}
            shape={shape}
            onSaved={() => stats.countDownload(card.id, shape)}
          />
        </div>
      ) : null}
    </dialog>
  );
}
