import { useCallback, type KeyboardEvent } from 'react';
import { useArcade, useArcadeUrl } from '@/services/arcade-context';
import type { GameCard } from '@/api/catalog/game-card';
import { TrailerIcon } from '@/screens/home/home-icons';
import { OfflineTag } from '@/screens/home/offline-saves/OfflineTag';
import { startTrailer, stopTrailer, tapTrailer, trailerFor } from './trailer-player.js';
import type { Details } from './use-details';

const artClass = (card: GameCard, name: string) => (card.smoothArt ? `${name} is-smooth` : name);

function onKey(event: KeyboardEvent<HTMLVideoElement>) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    tapTrailer(event.currentTarget);
  }
}

// Started from the ref, which runs inside the tap that mounted it: browsers let sound start only then.
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
      tabIndex={0}
      playsInline
      disablePictureInPicture
      preload="auto"
      onClick={(event) => tapTrailer(event.currentTarget)}
      onKeyDown={onKey}
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
      onClick={() => details.watch()}
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
