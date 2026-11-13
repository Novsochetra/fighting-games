import type { CSSProperties } from 'react';
import { useArcade } from '@/services/arcade-context';
import { formatCompact } from '@/utils/format.js';
import { TileHeartIcon, TileDownloadIcon } from './wallpaper-icons';
import type { WallpaperCard } from './wallpaper-types';
import type { WallpaperStats } from './use-wallpaper-stats';

// two tiles across a phone, three across a tablet, four from 64rem (wallpapers.css), where its
// min-width already holds at exactly 64rem
const TILE_SIZES = '(max-width: 39.99rem) 50vw, (max-width: 63.99rem) 33vw, 17rem';
// the first two rows show before any scroll, so they load at once; the rest as they come near
const EAGER_TILES = 8;

interface GridProps {
  cards: WallpaperCard[];
  stats: WallpaperStats;
  onOpen: (card: WallpaperCard) => void;
}

// how many liked it and saved it, once the counts are in, small at the tile's foot
function TileStats({ card, stats }: { card: WallpaperCard; stats: WallpaperStats }) {
  const { locale } = useArcade();
  const { likes, downloads } = stats.countOf(card.id);

  return stats.hasCounts ? (
    <span className="wallpaper-tile__stats" data-liked={stats.isLiked(card.id)}>
      <span className="wallpaper-tile__stat">
        <TileHeartIcon />
        {formatCompact(likes, locale)}
        <span className="wallpaper-tile__unseen"> likes,</span>
      </span>
      <span className="wallpaper-tile__stat">
        <TileDownloadIcon />
        {formatCompact(downloads, locale)}
        <span className="wallpaper-tile__unseen"> downloads</span>
      </span>
    </span>
  ) : null;
}

export function WallpaperGrid({ cards, stats, onOpen }: GridProps) {
  return (
    <ul className="wallpaper-grid" id="wallpaper-grid">
      {cards.map((card, index) => (
        <li
          className="wallpaper-grid__item"
          key={card.id}
          style={{ '--order': Math.min(index, EAGER_TILES) } as CSSProperties}
        >
          <button
            className="wallpaper-tile"
            type="button"
            data-wallpaper={card.id}
            onClick={() => onOpen(card)}
          >
            <img
              className="wallpaper-tile__image"
              src={card.thumb.src}
              srcSet={card.thumb.srcSet}
              sizes={TILE_SIZES}
              width="640"
              height="360"
              alt=""
              loading={index < EAGER_TILES ? 'eager' : 'lazy'}
              decoding="async"
            />
            <span className="wallpaper-tile__place">{card.place}</span>
            <span className="wallpaper-tile__foot">
              <span className="wallpaper-tile__time">{card.time}</span>
              <TileStats card={card} stats={stats} />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
