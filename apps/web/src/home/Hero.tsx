import type { Ref } from 'react';
import { Notice } from '../arcade/Notice';
import { Carousel } from './Carousel';
import { Backdrop } from './GameArt';
import { useHome } from './home-context';
import { Spotlight } from './Spotlight';

export const LOADING_MESSAGE = 'Loading games…';
export const ERROR_MESSAGE = 'The game list did not load. Check your connection, then try again.';
export const EMPTY_MESSAGE = 'No games yet.';

const NOTICES = {
  loading: { tone: 'loading', message: LOADING_MESSAGE },
  error: { tone: 'error', message: ERROR_MESSAGE },
  empty: { tone: 'empty', message: EMPTY_MESSAGE },
  games: { tone: 'loading', message: '' },
} as const;

function Backdrops() {
  const { cards, selected } = useHome();

  return (
    <div className="hero__backdrops" id="backdrops" aria-hidden="true">
      {cards.map((card, index) => (
        <Backdrop key={card.id} card={card} index={index} isActive={index === selected} />
      ))}
    </div>
  );
}

function Pager() {
  const { cards, selected } = useHome();

  return (
    <div className="pager" id="pager" aria-hidden="true" hidden={cards.length < 2}>
      {cards.map((card, index) => (
        <span
          className={`pager__dot${index === selected ? ' is-active' : ''}`}
          key={card.id}
          data-game-index={index}
        />
      ))}
    </div>
  );
}

function Stage() {
  const { selection } = useHome();

  return (
    <div className="stage" id="stage" hidden={!selection}>
      <div className="stage__heading">
        <p className="stage__prompt">Choose your game</p>
        <Pager />
      </div>
      <Carousel />
      {selection ? <Spotlight selection={selection} /> : null}
    </div>
  );
}

// The selected game's art fills the hero behind the carousel; a teaser shows a plain one.
export function Hero({ noticeRef }: { noticeRef: Ref<HTMLDivElement> }) {
  const home = useHome();
  const card = home.cards[home.selected];
  const notice = NOTICES[home.phase];

  return (
    <section
      className="hero"
      id="hero"
      aria-labelledby="home-title"
      data-backdrop={card && card.bannerSrc !== '' ? 'art' : 'plain'}
    >
      <Backdrops />
      <div className="hero__frost" aria-hidden="true" />
      <div className="hero__scrim" aria-hidden="true" />
      <div className="hero__content">
        <Notice
          tone={notice.tone}
          message={notice.message}
          hidden={home.phase === 'games'}
          onRetry={() => home.query.refetch()}
          retryLook="glass"
          noticeRef={noticeRef}
        />
        <Stage />
      </div>
    </section>
  );
}
