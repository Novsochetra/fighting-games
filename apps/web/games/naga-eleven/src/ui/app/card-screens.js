import { CLOSING_CARD } from '../../data/story/closing.js';
import { drawChapterTitle } from '../../render/title/chapter-title.js';
import { CLOSING_BEATS, drawClosingCard } from '../../render/title/closing-card.js';
import { wasPressed } from '../../sim/input-state.js';

function heldCard({ ticks, skippable, draw }) {
  const state = { age: 0 };
  const skip = () => {
    if (state.age > skippable) {
      state.age = ticks;
    }
  };

  return {
    kind: 'card',
    playing: false,
    step: (input) => {
      state.age += 1;

      if (wasPressed(input, 'pass')) {
        skip();
      }
    },
    draw: (context, tick) => draw(context, { tick, age: state.age }),
    tap: skip,
    isDone: () => state.age >= ticks,
    result: () => undefined,
  };
}

export const chapterCardScreen = ({ number, title, lang }) =>
  heldCard({
    ticks: 240,
    skippable: 45,
    draw: (context, { tick, age }) => drawChapterTitle(context, { number, title, lang, tick, age }),
  });

// the story's last card stays longer, so its moral is read before the menu comes back
export const closingCardScreen = ({ lang }) =>
  heldCard({
    ticks: 480,
    skippable: CLOSING_BEATS.moral + 15,
    draw: (context, { tick, age }) =>
      drawClosingCard(context, { ...CLOSING_CARD, lang, tick, age }),
  });
