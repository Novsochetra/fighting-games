import { setAriaFlag } from './aria.js';
import { circularOffset, isJump, slotFor } from './carousel-layout.js';
import { animateWith, readTiming } from './motion-tokens.js';
import { renderAll, renderCard, renderDot } from './render-cards.js';

const SLOT_PROPERTIES = [
  ['side', '--side'],
  ['shift', '--shift'],
  ['distance', '--distance'],
  ['scale', '--scale'],
  ['dimming', '--dimming'],
  ['opacity', '--card-opacity'],
  ['depth', '--depth'],
];

function placeCard(card, slot) {
  for (const [key, property] of SLOT_PROPERTIES) {
    card.style.setProperty(property, String(slot[key]));
  }
  card.classList.toggle('is-center', slot.isCenter);
  card.classList.toggle('is-hidden', slot.isHidden);
  card.tabIndex = slot.isCenter ? 0 : -1;
  setAriaFlag(card, 'aria-current', slot.isCenter);
  setAriaFlag(card, 'aria-hidden', slot.isHidden);
}

// A card that crosses to the other side goes there at once and fades in, instead of sliding over the
// center card. Reading its box makes the browser apply the jump before the transition is back on.
function jumpCard(card, slot) {
  card.style.transition = 'none';
  placeCard(card, slot);
  card.getBoundingClientRect();
  card.style.removeProperty('transition');
  if (!slot.isHidden) {
    const timing = readTiming(card.ownerDocument, {
      duration: '--duration-fade',
      easing: '--easing-standard',
    });
    animateWith(card, [{ opacity: 0 }, { opacity: slot.opacity }], timing);
  }
}

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
  const cards = () => [...track.querySelectorAll('.card')];
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
    all.forEach((card, index) => {
      const offset = circularOffset(index, selected, all.length);
      const move = isJump(offsets[index], offset) ? jumpCard : placeCard;
      move(card, slotFor(offset));
      offsets[index] = offset;
    });
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
