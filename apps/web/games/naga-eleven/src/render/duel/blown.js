import { LOOK_ART } from '../../art/duel/looks.js';
import { drawCutinFigure } from './cutin-figure.js';
import { drawFocusLines } from './focus-lines.js';
import { ART, INNER } from './layout.js';
import { portraitOf } from './portrait-card.js';
import { playerIn, shownRound } from './show.js';

const FRAMES = 6;
const FRAME_TICKS = 6;

// the word waits until the two are down, or its banner hides them flying apart
export const BLOWN_WORD_AFTER = 30;

export function isBlownAway(show) {
  const round = shownRound(show);

  return round?.kind === 'field' && round.result?.word === 'through' && !show.saveCam;
}

export function drawBlownAway(pen, show, { tick }) {
  const round = shownRound(show);
  const art = LOOK_ART[round.picked.attack?.look] ?? LOOK_ART.plain;
  const ticks = show.stage === 'result' ? show.stageTicks : FRAMES * FRAME_TICKS;
  const centre = { x: ART.width / 2, y: (INNER.top + INNER.bottom) / 2 };

  pen.rect([0, INNER.top, ART.width, INNER.bottom - INNER.top], art.sky[0]);
  drawFocusLines(pen, { centre, inner: 24, color: art.body[3], tick, strength: 0.6 });
  drawCutinFigure(pen, {
    name: 'defenders',
    index: Math.min(FRAMES - 1, Math.floor(ticks / FRAME_TICKS)),
    feet: { x: centre.x, y: INNER.bottom - 14 },
    look: portraitOf(playerIn(show, round, 'defend'), {
      mood: 'shocked',
      heroAge: show.heroAge,
      match: show.match,
    }),
  });
}
