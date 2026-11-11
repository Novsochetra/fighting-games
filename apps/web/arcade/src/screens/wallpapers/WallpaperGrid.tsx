import type { CSSProperties } from 'react';
import type { WallpaperCard } from './wallpaper-types';

// two tiles across a phone, three across a tablet, four from 64rem (wallpapers.css), where its
// min-width already holds at exactly 64rem
const TILE_SIZES = '(max-width: 39.99rem) 50vw, (max-width: 63.99rem) 33vw, 17rem';
// the first two rows show before any scroll, so they load at once; the rest as they come near
const EAGER_TILES = 8;

interface GridProps {
  cards: WallpaperCard[];
  onOpen: (card: WallpaperCard) => void;
}

export function WallpaperGrid({ cards, onOpen }: GridProps) {
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
            <span className="wallpaper-tile__time">{card.time}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
