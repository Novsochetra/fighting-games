import { nextSlots } from './carousel-slots.js';

// the cards two places out are the last in sight
const DEPTH_OUT_OF_SIGHT = 3;

function setSlot(card, slot) {
  card.style.setProperty('--slot', slot);
  card.dataset.slot = slot;
  card.dataset.depth = Math.min(Math.abs(slot), DEPTH_OUT_OF_SIGHT);
}

// a card that comes round the loop is put out of sight with its slide turned off, and styles are
// worked out there before it slides in, or it would slide from where it went out
function place(card, { slot, from }) {
  if (from !== null) {
    card.classList.add('wrap');
    setSlot(card, from);
    card.getBoundingClientRect();
    card.classList.remove('wrap');
  }
  setSlot(card, slot);
}

// turns the carousel to `center` and returns where every card now stands
export function turnCarousel(cards, center, previous) {
  const placed = nextSlots(previous, center, cards.length);
  placed.forEach((spot, index) => place(cards[index], spot));
  return placed.map((spot) => spot.slot);
}
