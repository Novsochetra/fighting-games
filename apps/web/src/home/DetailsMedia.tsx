import { useCallback } from 'react';
import { useArcade, useArcadeUrl } from '../arcade/arcade-context';
import type { GameCard } from './game-card';
import { TrailerIcon } from './home-icons';
import { OfflineTag } from './OfflineTag';
import { startTrailer, stopTrailer, trailerFor } from './trailer-player.js';
import type { Details } from './use-details';

const artClass = (card: GameCard, name: string) => (card.smoothArt ? `${name} is-smooth` : name);

// It plays as it comes onto the page, in the tap that asked for it, and stops as it leaves.
function TrailerVideo({ card }: { card: GameCard }) {
  const url = useArcadeUrl();
  const { preferences, window } = useArcade();
  const src = url(trailerFor(card, window));
  const play = useCallback(
    (video: HTMLVideoElement) => {
      startTrailer(video, { src, withSound: preferences.isSoundOn() });
      video.focus({ preventScroll: true });

      return () => stopTrailer(video);
    },
    [src, preferences],
  );

  return (
    <video
      className={artClass(card, 'sheet__video')}
      id="details-trailer"
      poster={card.artSrc ? url(card.artSrc) : undefined}
      aria-label={`${card.title} trailer`}
      controls
      playsInline
      preload="auto"
      ref={play}
    />
  );
}

function TrailerButton({ card, details }: { card: GameCard; details: Details }) {
  return (
    <button
      className="pill-button pill-button--glass sheet__trailer"
      id="details-trailer-open"
      type="button"
      aria-label={`Watch the ${card.title} trailer`}
      onClick={() => details.watch(card, 'details')}
    >
      <TrailerIcon />
      Trailer
    </button>
  );
}

function Art({ card }: { card: GameCard | null }) {
  const url = useArcadeUrl();
  const art = card?.artSrc ?? '';

  return (
    <>
      <img
        className={card ? artClass(card, 'sheet__art') : 'sheet__art'}
        id="details-art"
        src={art ? url(art) : undefined}
        alt=""
      />
      <OfflineTag card={card} />
    </>
  );
}

// The game's frame of play, which turns into its trailer, if it has one.
export function DetailsMedia({ details }: { details: Details }) {
  const { card, isWatching } = details;
  const trailer = card?.trailerSrc ? card : null;

  if (trailer && isWatching) {
    return (
      <div className="sheet__media">
        <TrailerVideo card={trailer} />
      </div>
    );
  }

  return (
    <div className="sheet__media" hidden={!card?.artSrc && !trailer}>
      <Art card={card} />
      {trailer ? <TrailerButton card={trailer} details={details} /> : null}
    </div>
  );
}
