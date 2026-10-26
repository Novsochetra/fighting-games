import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { createCarouselMotion } from './carousel-motion.js';
import type { GameCard } from './game-card';
import { GameArt } from './GameArt';
import { useHome } from './home-context';
import { OfflineTag } from './OfflineTag';
import { SaveButton } from './SaveButton';
import { useCarouselGestures } from './use-carousel-gestures';

// The cards near the center are seen at once; the rest load as the carousel brings them near.
export const EAGER_CARD_COUNT = 5;

interface CarouselCardProps {
  card: GameCard;
  index: number;
  // drawn over the art, such as the Offline tag
  children?: ReactNode;
}

// The cards are placed by the carousel's turn (card-motion.js), which owns their slot, their ring
// and their place in the tab order; React only puts them on the page.
export function CarouselCard({ card, index, children }: CarouselCardProps) {
  return (
    <button
      className="card"
      type="button"
      data-game-index={index}
      tabIndex={-1}
      aria-label={card.title}
    >
      <span className="card__ring" aria-hidden="true" />
      <span className="card__frame">
        <GameArt card={card} loading={index < EAGER_CARD_COUNT ? 'eager' : 'lazy'} />
        {children}
      </span>
    </button>
  );
}

function useCarouselTurns(track: React.RefObject<HTMLDivElement | null>) {
  const { cards, selection } = useHome();
  const motion = useRef<ReturnType<typeof createCarouselMotion> | null>(null);

  useLayoutEffect(() => {
    motion.current = createCarouselMotion(track.current!);
  }, [cards, track]);

  useLayoutEffect(() => {
    if (selection) {
      motion.current?.turnTo(selection.index, { focus: selection.focus === 'carousel' });
    }
  }, [selection]);
}

const Arrow = ({
  side,
  hidden,
  onClick,
}: {
  side: 'previous' | 'next';
  hidden: boolean;
  onClick: () => void;
}) => (
  <button
    className={`glass-button carousel__arrow carousel__arrow--${side}`}
    id={side}
    type="button"
    aria-label={side === 'previous' ? 'Previous game' : 'Next game'}
    hidden={hidden}
    onClick={onClick}
  >
    <svg className="icon icon--bold" viewBox="0 0 24 24" aria-hidden="true">
      <path d={side === 'previous' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  </button>
);

export function Carousel() {
  const home = useHome();
  const carousel = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const isSingle = home.cards.length < 2;
  // one save button floats on the center card's corner, coming in again with each card it serves
  const selected = home.cards[home.selected];
  const onTrackClick = useCarouselGestures(carousel);

  useCarouselTurns(track);

  return (
    <div
      className="carousel"
      id="carousel"
      role="group"
      aria-roledescription="carousel"
      aria-label="Games"
      ref={carousel}
    >
      <div className="carousel__track" id="carousel-track" ref={track} onClick={onTrackClick}>
        {home.cards.map((card, index) => (
          <CarouselCard key={card.id} card={card} index={index}>
            <OfflineTag card={card} />
          </CarouselCard>
        ))}
      </div>
      {selected && <SaveButton key={selected.id} card={selected} id="card-save" place="card" />}
      <Arrow side="previous" hidden={isSingle} onClick={() => home.step(-1)} />
      <Arrow side="next" hidden={isSingle} onClick={() => home.step(1)} />
    </div>
  );
}
