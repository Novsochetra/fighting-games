import { BALL } from '../../../art/training/people.js';
import { CARD } from '../../../art/training/cards.js';
import { DRILLS } from '../../../data/training.js';
import { powerOf, riseOf } from '../../../training/target-shot/shot.js';
import { targetAt } from '../../../training/target-shot/targets.js';
import { drawBall } from '../ball.js';
import { faded, paint, ring } from '../pixels.js';
import { ballInFlight, toArt } from './view.js';

const TUNING = DRILLS['target-shot'].tuning;
const NET_FLOOR = 116;

// where the ball goes once it has reached the goal, by what it met there
const AFTER = {
  hit: (from, ticks) => ({
    x: from.x,
    y: Math.min(NET_FLOOR, from.y + ticks * ticks * 0.15),
    alpha: 1,
  }),
  saved: (from, ticks) => ({
    x: from.x + ticks * 1.5,
    y: from.y + ticks * 2,
    alpha: 1 - ticks / 40,
  }),
  over: (from, ticks) => ({ x: from.x, y: from.y - ticks * 2, alpha: 1 - ticks / 16 }),
  wide: (from, ticks) => ({
    x: from.x + Math.sign(from.x - 192) * ticks * 2,
    y: from.y,
    alpha: 1 - ticks / 16,
  }),
  short: (from, ticks) => ({ x: from.x, y: Math.max(140, from.y), alpha: 1 - ticks / 40 }),
};

function drawTrail(context, run) {
  for (let back = 3; back >= 1; back -= 1) {
    const earlier = ballInFlight({
      ...run,
      ball: { ...run.ball, ticks: run.ball.ticks - back * 2 },
    });

    faded(context, 0.5 - back * 0.12, () =>
      paint(context, BALL.trail, [earlier.x - 1, earlier.y - 1, 2, 2]),
    );
  }
}

function drawAfter(context, run) {
  const kind = run.results.at(-1);
  const path = AFTER[kind === 'net' || kind === 'lateHit' ? 'hit' : kind];

  if (!path || !run.ball) {
    return;
  }

  const spot = path(toArt(run.ball.to), run.stageTicks);

  faded(context, spot.alpha, () =>
    drawBall(context, { x: spot.x, y: spot.y, radius: 2, travel: run.stageTicks }),
  );
}

export function drawFlight(context, run) {
  if (run.stage === 'after') {
    drawAfter(context, run);

    return;
  }

  if (run.stage !== 'flight') {
    return;
  }

  const ball = ballInFlight(run);

  drawTrail(context, run);
  drawBall(context, { x: ball.x, y: ball.y, radius: ball.radius, travel: run.ball.ticks * 3 });
}

function bracket(context, color, { x, y }) {
  for (const [dx, dy] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    paint(context, color, [x + dx * 7 - (dx > 0 ? 2 : 0), y + dy * 7 - (dy > 0 ? 0 : 0), 3, 1]);
    paint(context, color, [x + dx * 7, y + dy * 7 - (dy > 0 ? 2 : 0), 1, 3]);
  }

  paint(context, color, [x, y, 1, 1]);
}

// the reticle, gold when on the lit target; while charging, a ring shows where the ball will land
export function drawAim(context, run) {
  if (run.stage !== 'aim') {
    return;
  }

  const place = toArt(run.aim);
  const onTarget = targetAt(run.target, run.aim, TUNING.targetRadius);

  bracket(context, CARD.shadow, { x: place.x + 1, y: place.y + 1 });
  bracket(context, onTarget ? CARD.gold : CARD.text, place);

  if (run.charge > 0) {
    const rise = riseOf(powerOf(run.charge, TUNING), TUNING);
    const landing = toArt({ x: run.aim.x, y: run.aim.y + rise });

    faded(context, 0.8, () => ring(context, CARD.gold, { x: landing.x, y: landing.y, radius: 3 }));
  }
}
