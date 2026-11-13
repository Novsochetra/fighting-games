import { useLayoutEffect, useRef, type MouseEvent } from 'react';
import { useArcade } from '@/services/arcade-context';
import { HEART_PATH } from '@/components/icons';
import { EVENTS } from '@/services/analytics/analytics-events.js';
import { formatCompact } from '@/utils/format.js';
import { burstSparks, floatBigHeart, popLikeHeart, rollCount } from './like-motion.js';
import type { WallpaperCard } from './wallpaper-types';
import type { WallpaperStats } from './use-wallpaper-stats';

const SPARKS = 6;

// Rolls only as the count changes under the eye; the button is drawn afresh for each wallpaper, so
// opening another one shows its count still.
function RollingCount({ value }: { value: number }) {
  const { locale } = useArcade();
  const element = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);

  useLayoutEffect(() => {
    if (element.current && value !== shown.current) {
      rollCount(element.current, value > shown.current ? 'up' : 'down');
    }

    shown.current = value;
  }, [value]);

  return (
    <span className="like-button__count" id="wallpaper-likes" ref={element}>
      {formatCompact(value, locale)}
    </span>
  );
}

// A like plays out on the heart, round it and over the picture (the preview's big heart); taking it
// back only empties the heart.
function celebrate(button: HTMLElement) {
  const sparks = [...button.querySelectorAll<SVGElement>('.like-spark')];
  const bigHeart = button
    .closest('.wallpaper-sheet')
    ?.querySelector<SVGElement>('.wallpaper-preview__heart');

  popLikeHeart(button.querySelector('.like-button__heart')!);
  burstSparks(sparks);

  if (bigHeart) {
    floatBigHeart(bigHeart);
  }
}

interface LikeProps {
  card: WallpaperCard;
  stats: WallpaperStats;
}

// A heart that fills as it is liked, with how many have, as a post's like in Photos' shared albums.
export function LikeButton({ card, stats }: LikeProps) {
  const { sound, analytics } = useArcade();
  const isLiked = stats.isLiked(card.id);
  const { likes } = stats.countOf(card.id);

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    stats.toggleLike(card.id);
    sound.play(isLiked ? 'favoriteOff' : 'favoriteOn');
    analytics.track(EVENTS.wallpaperLike, { wallpaper: card.id, liked: !isLiked });

    if (!isLiked) {
      celebrate(event.currentTarget);
    }
  }

  return (
    <button
      className="glass-button glass-button--labeled like-button"
      id="wallpaper-like"
      type="button"
      aria-pressed={isLiked}
      aria-label={`Like, ${likes} ${likes === 1 ? 'like' : 'likes'}`}
      onClick={toggle}
    >
      <span className="like-button__mark">
        <svg className="icon like-button__heart" viewBox="0 0 24 24" aria-hidden="true">
          <path d={HEART_PATH} />
        </svg>
        {Array.from({ length: SPARKS }, (_, index) => (
          <svg className="like-spark" key={index} viewBox="0 0 24 24" aria-hidden="true">
            <path d={HEART_PATH} />
          </svg>
        ))}
      </span>
      <RollingCount value={likes} />
    </button>
  );
}
