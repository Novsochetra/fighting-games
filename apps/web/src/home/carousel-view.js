import { moveCard } from './card-motion.js';
import { planTurn } from './carousel-layout.js';
import { animateWith, readTiming } from './motion-tokens.js';
import { renderAll, renderCard, renderDot } from './render-cards.js';

const NUDGE_KEYFRAMES = [0, -8, 7, -5, 3, 0].map((x) => ({ transform: `translateX(${x}px)` }));

function nudge(frame) {
  if (frame) {
    const timing = readTiming(frame.ownerDocument, {
      duration: '--duration-nudge',
      easing: '--easing-standard',
    });
    animateWith(frame, NUDGE_KEYFRAMES, timing);
  }
}

export function createCarouselView({ track, pager, arrows }) {
  let offsets = [];
  const cards = () => [...track.querySelectorAll('.card:not(.is-leaving)')];
  const cardAt = (index) => track.querySelector(`.card[data-game-index="${Number(index)}"]`);

  function render(gameCards) {
    track.innerHTML = renderAll(gameCards, renderCard);
    pager.innerHTML = renderAll(gameCards, renderDot);
    const isSingle = gameCards.length < 2;
    pager.hidden = isSingle;
    arrows.forEach((arrow) => {
      arrow.hidden = isSingle;
    });
    offsets = [];
  }

  function select(selected, { focus = false } = {}) {
    const all = cards();
    const moves = planTurn(offsets, selected, all.length);
    all.forEach((card, index) => moveCard(card, moves[index]));
    offsets = moves.map(({ offset }) => offset);
    pager.querySelectorAll('.pager__dot').forEach((dot, index) => {
      dot.classList.toggle('is-active', index === selected);
    });
    if (focus) {
      cardAt(selected)?.focus({ preventScroll: true });
    }
  }

  const frameAt = (index) => cardAt(index)?.querySelector('.card__frame');
  return { render, select, cardAt, frameAt, nudge: (index) => nudge(frameAt(index)) };
}
