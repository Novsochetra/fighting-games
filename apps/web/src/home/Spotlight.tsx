import { useLayoutEffect, useRef, type MouseEvent, type RefObject } from 'react';
import { useArcade, useArcadeUrl } from '../arcade/arcade-context';
import type { GameCard } from './game-card';
import { useHome } from './home-context';
import { PlayIcon } from './home-icons';
import { isPlainClick } from './input-actions.js';
import { riseText } from './spotlight-motion.js';
import { useActionRow } from './use-action-row';
import type { Selection } from './use-selection';

const HEART_PATH =
  'M12 20.5s-7.5-4.6-9.2-9.4C1.7 7.8 3.9 4.5 7.3 4.5c2 0 3.6 1.1 4.7 2.7 1.1-1.6 2.7-2.7 4.7-2.7 3.4 0 5.6 3.3 4.5 6.6-1.7 4.8-9.2 9.4-9.2 9.4z';

function useTextRise(text: RefObject<HTMLElement | null>, selection: Selection) {
  const rising = useRef<Animation | null>(null);

  useLayoutEffect(() => {
    if (selection.animate) {
      rising.current = riseText(text.current!, rising.current);
    }
  }, [selection, text]);
}

// A teaser's Play turns into a quiet Coming Soon, like a film not out yet, and there is nothing to
// read in Details or to keep in Favorites.
function PlayLink({ card }: { card: GameCard }) {
  const home = useHome();
  const url = useArcadeUrl();
  const soon = Boolean(card.isComingSoon);
  const onClick = (event: MouseEvent) => {
    if (isPlainClick(event)) {
      event.preventDefault();
      home.details.finish();
      home.open(home.selected, 'play_button');
    }
  };

  return (
    <a
      className={`pill-button pill-button--primary${soon ? ' is-unavailable' : ''}`}
      id="play"
      href={soon ? undefined : url(card.href)}
      aria-label={soon ? undefined : `Play ${card.title}`}
      onClick={onClick}
    >
      <PlayIcon />
      <span id="play-label">{soon ? 'Coming Soon' : 'Play'}</span>
    </a>
  );
}

function Actions({ card, selected }: { card: GameCard; selected: GameCard }) {
  const home = useHome();
  const { preferences } = useArcade();
  const soon = Boolean(card.isComingSoon);

  return (
    <>
      <PlayLink card={card} />
      <button
        className="pill-button pill-button--glass"
        id="details-open"
        type="button"
        aria-haspopup="dialog"
        hidden={soon}
        onClick={() => home.details.open(selected)}
      >
        Details
      </button>
      <button
        className="glass-button glass-button--large favorite"
        id="favorite"
        type="button"
        aria-pressed={preferences.isFavorite(selected.id)}
        aria-label="Favorite"
        hidden={soon}
        onClick={home.toggleFavorite}
      >
        <svg className="icon favorite__heart" viewBox="0 0 24 24" aria-hidden="true">
          <path d={HEART_PATH} />
        </svg>
      </button>
    </>
  );
}

export function Spotlight({ selection }: { selection: Selection }) {
  const { cards } = useHome();
  const card = cards[selection.index]!;
  const text = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const shown = useActionRow(card, selection.animate, row);

  useTextRise(text, selection);

  return (
    <div className="spotlight">
      <div className="spotlight__text" id="spotlight-text" aria-live="polite" ref={text}>
        <h2 className="spotlight__title" id="spotlight-title">
          {card.title}
        </h2>
        <p className="spotlight__meta" id="spotlight-meta">
          {card.meta}
        </p>
        <p className="spotlight__summary" id="spotlight-summary">
          {card.summary}
        </p>
      </div>
      <div className="spotlight__actions" ref={row}>
        <Actions card={shown} selected={card} />
      </div>
    </div>
  );
}
