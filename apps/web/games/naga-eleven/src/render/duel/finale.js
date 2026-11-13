import { LOOK_ART } from '../../art/duel/looks.js';
import { FINALE_SHOTS } from '../../data/shots.js';
import { drawCutinBall, drawCutinFigure } from './cutin-figure.js';
import { drawFocusLines } from './focus-lines.js';
import { ART, INNER } from './layout.js';
import { lensPen } from './lens/lens-pen.js';
import { shotView } from './lens/shot-view.js';
import { portraitOf } from './portrait-card.js';
import { playerIn, shownRound } from './show.js';

const MIDDLE = { x: ART.width / 2, y: (INNER.top + INNER.bottom) / 2 };

// the finale's beats, in ticks: the ball at the camera, the net tearing, the keeper flung back
// into it and left dazed (keeper frames 3 to 6)
const BALL = { until: 12, each: 2 };
const NET = { until: 30, each: 3 };
const KEEPER = { each: 8, frames: [2, 3, 4, 5] };

const BIG_FAMILIES = new Set(['star', 'combo']);

export function hasFinale(show) {
  const round = shownRound(show);

  return (
    round?.kind === 'keeper' &&
    round.result?.word === 'goal' &&
    BIG_FAMILIES.has(round.picked.attack?.family)
  );
}

function stage(pen, { art, tick }) {
  pen.rect([0, INNER.top, ART.width, INNER.bottom - INNER.top], art.sky[0]);
  drawFocusLines(pen, { centre: MIDDLE, inner: 28, color: art.body[3], tick, strength: 0.8 });
}

function keeper(pen, show, ticks) {
  const round = shownRound(show);
  const at = Math.floor((ticks - NET.until) / KEEPER.each);

  drawCutinFigure(pen, {
    name: 'keeper',
    index: KEEPER.frames[Math.min(KEEPER.frames.length - 1, at)],
    feet: { x: MIDDLE.x, y: INNER.bottom - 6 },
    look: portraitOf(playerIn(show, round, 'defend'), {
      mood: 'hurt',
      heroAge: show.heroAge,
      match: show.match,
    }),
  });
}

const FLUNG = { x: MIDDLE.x, y: INNER.bottom - 30 };

export function drawFinale(base, show, { tick }) {
  const art = LOOK_ART[shownRound(show).picked.attack.look] ?? LOOK_ART.plain;
  const ticks = show.stageTicks;
  const pen = lensPen(base, shotView(show.cinema, FINALE_SHOTS, ticks, { keeper: FLUNG }));

  stage(pen, { art, tick });

  if (ticks < BALL.until) {
    drawCutinBall(pen, { name: 'ball', index: Math.floor(ticks / BALL.each), at: MIDDLE, art });
  } else if (ticks < NET.until) {
    const index = Math.floor((ticks - BALL.until) / NET.each);

    drawCutinBall(pen, { name: 'net', index, at: MIDDLE, art });
  } else {
    keeper(pen, show, ticks);
  }
}
