import { useArcadeUrl } from '../arcade/arcade-context';
import type { GameCard } from './game-card';

// Phones fill their art from the poster, the tall crop of a game's key art.
export const NARROW_MEDIA = '(max-width: 43.75rem)';

const artClass = (base: string, card: GameCard) => (card.smoothArt ? `${base} is-smooth` : base);

const Sparkles = () => (
  <svg className="art__glyph" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M10 3.5l1.6 4.9 4.9 1.6-4.9 1.6L10 16.5l-1.6-4.9L3.5 10l4.9-1.6zM18 13.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z" />
  </svg>
);

// A game's picture on its card and tile: a frame of play, its first letter while it has none, and a
// sparkle for a teaser.
export function GameArt({ card, loading }: { card: GameCard; loading: 'eager' | 'lazy' }) {
  const url = useArcadeUrl();

  if (card.isComingSoon) {
    return (
      <span className="art art--soon" aria-hidden="true">
        <Sparkles />
        <span className="art__label">{card.title}</span>
      </span>
    );
  }

  if (card.artSrc === '') {
    return (
      <span className="art art--monogram" aria-hidden="true">
        {card.monogram}
      </span>
    );
  }

  return (
    <img
      className={artClass('art', card)}
      src={url(card.artSrc)}
      alt=""
      loading={loading}
      decoding="async"
      draggable="false"
    />
  );
}

// The key art behind the carousel; phones fill it from the poster, its tall crop.
export function Backdrop({
  card,
  index,
  isActive,
}: {
  card: GameCard;
  index: number;
  isActive: boolean;
}) {
  const url = useArcadeUrl();
  const active = isActive ? ' is-active' : '';

  if (card.bannerSrc === '') {
    const soon = card.isComingSoon ? ' backdrop--soon' : '';

    return <div className={`backdrop${soon}${active}`} data-game-index={index} />;
  }

  return (
    <picture className={`backdrop${active}`} data-game-index={index}>
      <source media={NARROW_MEDIA} srcSet={url(card.posterSrc)} />
      <img
        className={artClass('backdrop__img', card)}
        src={url(card.bannerSrc)}
        alt=""
        decoding="async"
      />
    </picture>
  );
}
