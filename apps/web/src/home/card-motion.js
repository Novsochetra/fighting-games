import { setAriaFlag } from './aria.js';
import { slotFor } from './carousel-layout.js';
import { prefersReducedMotion, readDuration } from './motion-tokens.js';

const SLOT_PROPERTIES = [
  ['side', '--side'],
  ['shift', '--shift'],
  ['distance', '--distance'],
  ['scale', '--scale'],
  ['dimming', '--dimming'],
  ['opacity', '--card-opacity'],
  ['depth', '--depth'],
];

function setSlot(card, slot) {
  for (const [key, property] of SLOT_PROPERTIES) {
    card.style.setProperty(property, String(slot[key]));
  }
}

function placeCard(card, slot) {
  setSlot(card, slot);
  card.classList.toggle('is-center', slot.isCenter);
  card.classList.toggle('is-hidden', slot.isHidden);
  card.tabIndex = slot.isCenter ? 0 : -1;
  setAriaFlag(card, 'aria-current', slot.isCenter);
  setAriaFlag(card, 'aria-hidden', slot.isHidden);
}

// Reading its box makes the browser apply the out-of-sight start before the transition is back on.
function slideIn(card, from) {
  card.style.transition = 'none';
  setSlot(card, { ...from, opacity: 0 });
  card.getBoundingClientRect();
  card.style.removeProperty('transition');
}

// One card cannot slide out by one side and in by the other at once, so a copy takes the way out.
function slideOut(card, to) {
  const document = card.ownerDocument;
  const duration = readDuration(document, '--duration-carousel');
  if (duration <= 0 || prefersReducedMotion(document.defaultView)) {
    return;
  }
  const copy = card.cloneNode(true);
  copy.removeAttribute('data-game-index');
  copy.classList.add('is-leaving');
  copy.setAttribute('aria-hidden', 'true');
  copy.inert = true;
  card.parentElement.append(copy);
  copy.getBoundingClientRect();
  copy.classList.remove('is-center');
  setSlot(copy, { ...to, opacity: 0 });
  document.defaultView.setTimeout(() => copy.remove(), duration);
}

export function moveCard(card, { offset, enterFrom, leaveTo }) {
  if (leaveTo !== null) {
    slideOut(card, slotFor(leaveTo));
  }
  if (enterFrom !== null) {
    slideIn(card, slotFor(enterFrom));
  }
  placeCard(card, slotFor(offset));
}
