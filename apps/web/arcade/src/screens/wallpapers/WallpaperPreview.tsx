import { useState } from 'react';
import { HEART_PATH } from '@/components/icons';
import type { Shape, WallpaperCard } from './wallpaper-types';

// the computer's cut fills the preview, the sheet's whole width: the screen on a phone, else
// --size-sheet (sheet.css); the phone's stands upright in it, about a third as wide
const SIZES: Record<Shape, string> = { desktop: '(max-width: 40rem) 100vw, 36rem', phone: '20rem' };
// the computer's cut lies under the phone's, which stands over it as it fades away
const DRAW_ORDER: Shape[] = ['desktop', 'phone'];

interface PictureProps {
  card: WallpaperCard;
  shape: Shape;
  isActive: boolean;
}

// Shown only once its file is in (data-loaded), so it fades in whole rather than drawing in.
function PreviewPicture({ card, shape, isActive }: PictureProps) {
  const [isLoaded, setLoaded] = useState(false);
  const picture = card.preview[shape];
  const device = shape === 'phone' ? 'phone' : 'computer';

  return (
    <img
      className="wallpaper-preview__image"
      id={isActive ? 'wallpaper-preview' : undefined}
      data-shape={shape}
      data-active={isActive}
      data-loaded={isLoaded}
      src={picture.src}
      srcSet={picture.srcSet}
      sizes={SIZES[shape]}
      alt={isActive ? `${card.place} at ${card.time.toLowerCase()}, cut for a ${device}` : ''}
      aria-hidden={!isActive}
      decoding="async"
      onLoad={() => setLoaded(true)}
    />
  );
}

// The cuts asked for so far: the other one comes down only once a visitor switches to it.
function useSeenShapes(shape: Shape) {
  const [seen, setSeen] = useState<Shape[]>([shape]);

  if (!seen.includes(shape)) {
    setSeen([...seen, shape]);
  }

  return DRAW_ORDER.filter((each) => seen.includes(each));
}

// How the wallpaper looks on each screen: the computer's cut fills the preview, and the phone's
// stands upright over the whole picture blurred, as a lock screen. Switching fades one into the
// other (wallpaper-sheet.css), in a preview whose size never changes with the cut.
export function WallpaperPreview({ card, shape }: { card: WallpaperCard; shape: Shape }) {
  const seen = useSeenShapes(shape);

  return (
    <div className="wallpaper-preview" data-shape={shape}>
      <img className="wallpaper-preview__behind" src={card.thumb.src} alt="" aria-hidden="true" />
      {seen.map((each) => (
        <PreviewPicture key={each} card={card} shape={each} isActive={each === shape} />
      ))}
      <svg className="wallpaper-preview__heart" viewBox="0 0 24 24" aria-hidden="true">
        <path d={HEART_PATH} />
      </svg>
    </div>
  );
}
