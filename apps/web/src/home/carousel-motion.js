import { moveCard } from './card-motion.js';
import { planTurn } from './carousel-layout.js';
import { animateWith, readTiming } from './motion-tokens.js';

const NUDGE_KEYFRAMES = [0, -8, 7, -5, 3, 0].map((x) => ({ transform: `translateX(${x}px)` }));

// A teaser shakes its head, like a locked app on a phone, and opens nothing.
export function nudgeFrame(frame) {
  if (frame) {
    const timing = readTiming(frame.ownerDocument, {
      duration: '--duration-nudge',
      easing: '--easing-standard',
    });

    animateWith(frame, NUDGE_KEYFRAMES, timing);
  }
}

// Turns the carousel to the selected card: each card slides to its slot (carousel-layout.js), from
// where the last turn left it.
export function createCarouselMotion(track) {
  let offsets = [];

  return {
    turnTo(selected, { focus = false } = {}) {
      const cards = [...track.querySelectorAll('.card:not(.is-leaving)')];
      const moves = planTurn(offsets, selected, cards.length);

      cards.forEach((card, index) => moveCard(card, moves[index]));
      offsets = moves.map(({ offset }) => offset);

      if (focus) {
        track
          .querySelector(`.card[data-game-index="${Number(selected)}"]`)
          ?.focus({ preventScroll: true });
      }
    },

    reset() {
      offsets = [];
    },
  };
}
