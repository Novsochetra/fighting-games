import { useArcade } from '@/services/arcade-context';
import { HEART_PATH } from '@/components/icons';
import { EVENTS } from '@/services/analytics/analytics-events.js';
import { formatCompact } from '@/utils/format.js';
import { downloadsLabel } from './wallpaper-list.js';
import type { WallpaperCard } from './wallpaper-types';
import type { WallpaperStats } from './use-wallpaper-stats';

interface HeadingProps {
  card: WallpaperCard;
  stats: WallpaperStats;
}

// A heart that fills as it is liked, with how many have, as a post's like in Photos' shared albums.
function LikeButton({ card, stats }: HeadingProps) {
  const { sound, analytics, locale } = useArcade();
  const isLiked = stats.isLiked(card.id);
  const { likes } = stats.countOf(card.id);

  return (
    <button
      className="glass-button glass-button--labeled like-button"
      id="wallpaper-like"
      type="button"
      aria-pressed={isLiked}
      aria-label={`Like, ${likes} ${likes === 1 ? 'like' : 'likes'}`}
      onClick={() => {
        stats.toggleLike(card.id);
        sound.play(isLiked ? 'favoriteOff' : 'favoriteOn');
        analytics.track(EVENTS.wallpaperLike, { wallpaper: card.id, liked: !isLiked });
      }}
    >
      <svg className="icon like-button__heart" viewBox="0 0 24 24" aria-hidden="true">
        <path d={HEART_PATH} />
      </svg>
      <span className="like-button__count" id="wallpaper-likes">
        {formatCompact(likes, locale)}
      </span>
    </button>
  );
}

export function WallpaperHeading({ card, stats }: HeadingProps) {
  const { locale } = useArcade();
  const { downloads } = stats.countOf(card.id);

  return (
    <div className="wallpaper-sheet__heading">
      <div className="wallpaper-sheet__names">
        <h2 className="sheet__title" id="wallpaper-title">
          {card.place}
        </h2>
        <p className="sheet__meta" id="wallpaper-meta">
          {card.time}
          {stats.hasCounts ? ` · ${downloadsLabel(downloads, locale)}` : ''}
        </p>
      </div>
      <LikeButton card={card} stats={stats} />
    </div>
  );
}
