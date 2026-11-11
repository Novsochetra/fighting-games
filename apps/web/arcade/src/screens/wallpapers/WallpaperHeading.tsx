import { useArcade } from '@/services/arcade-context';
import { LikeButton } from './LikeButton';
import { downloadsLabel } from './wallpaper-list.js';
import type { WallpaperCard } from './wallpaper-types';
import type { WallpaperStats } from './use-wallpaper-stats';

interface HeadingProps {
  card: WallpaperCard;
  stats: WallpaperStats;
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
      <LikeButton key={card.id} card={card} stats={stats} />
    </div>
  );
}
