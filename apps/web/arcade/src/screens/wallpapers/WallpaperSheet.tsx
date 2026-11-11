import { useRef, useState } from 'react';
import { useArcade } from '@/services/arcade-context';
import { Segmented } from '@/components/segmented/Segmented';
import { SheetClose } from '@/components/sheet/SheetClose';
import { useSheet } from '@/components/sheet/use-sheet';
import { firstShape } from './wallpaper-list.js';
import { WallpaperPreview } from './WallpaperPreview';
import { WallpaperSave } from './WallpaperSave';
import type { Shape, WallpaperCard } from './wallpaper-types';
import './wallpaper-sheet.css';

const SHAPES = [
  { value: 'phone', label: 'Phone' },
  { value: 'desktop', label: 'Computer' },
] as const;

interface SheetProps {
  card: WallpaperCard | null;
  isOpen: boolean;
  onClose: () => void;
}

// A wallpaper opened from the grid: how it looks on a phone or a computer, and its download.
export function WallpaperSheet({ card, isOpen, onClose }: SheetProps) {
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
          <h2 className="sheet__title" id="wallpaper-title">
            {card.place}
          </h2>
          <p className="sheet__meta">{card.time}</p>
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
          <WallpaperSave card={card} shape={shape} />
        </div>
      ) : null}
    </dialog>
  );
}
