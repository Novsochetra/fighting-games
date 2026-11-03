import { CARD, POP } from '../../art/training/cards.js';
import { VIEW } from '../../config.js';
import { MARK_TICKS } from '../../training/scoring.js';
import { HUD_BOTTOM } from './hud.js';
import { LABELS } from './labels.js';
import { say } from './panel.js';
import { faded, paint } from './pixels.js';

const COLORS = {
  clean: POP.good,
  finish: POP.great,
  hit: POP.good,
  lateHit: POP.great,
  net: POP.plain,
  perfect: POP.great,
  good: POP.cool,
};

const FADE = 20;
const RISE = 24;
const WORDS_OVER = 20;

// a mark starts low enough that its words, risen, still clear the HUD
const LOWEST_START = HUD_BOTTOM + 4 + RISE + WORDS_OVER;

// one word or score rising from where it happened, fading out at the end of its moment
function drawMark(context, { mark, place, tick, lang }) {
  const since = tick - mark.at;
  const rise = Math.min(RISE, since * 0.6);
  const color = COLORS[mark.kind] ?? POP.bad;
  const words = LABELS[mark.kind];
  const alpha = since > MARK_TICKS - FADE ? (MARK_TICKS - since) / FADE : 1;

  faded(context, alpha, () => {
    if (words && mark.kind !== 'clean' && mark.kind !== 'hit') {
      say(context, words, {
        lang,
        x: place.x,
        y: place.y - rise - WORDS_OVER,
        color,
        align: 'center',
      });
    }

    if (mark.points > 0) {
      say(context, `+${mark.points}`, { x: place.x, y: place.y - rise, color, align: 'center' });
    }
  });
}

// the rhythm drill's marks all rise from one place, so only the newest shows
export function drawMarks(context, state, { placeOf, lang, newestOnly = false }) {
  const marks = newestOnly ? state.marks.slice(-1) : state.marks;

  for (const mark of marks) {
    const place = placeOf(state, mark);

    drawMark(context, {
      mark,
      place: { x: place.x, y: Math.max(LOWEST_START, place.y) },
      tick: state.tick,
      lang,
    });
  }
}

export const BANNER_HEIGHT = 56;

// a band across the middle for READY, GO and the finish
export function drawBanner(
  context,
  { words, lang, color = CARD.gold, alpha = 1, top = VIEW.height / 2 - 30 },
) {
  faded(context, alpha, () => {
    faded(context, 0.75, () => paint(context, CARD.shadow, [0, top, VIEW.width, BANNER_HEIGHT]));
    paint(context, color, [0, top, VIEW.width, 2]);
    paint(context, color, [0, top + BANNER_HEIGHT - 2, VIEW.width, 2]);
    say(context, words, { lang, x: VIEW.width / 2, y: top + 16, color, size: 24, align: 'center' });
  });
}
