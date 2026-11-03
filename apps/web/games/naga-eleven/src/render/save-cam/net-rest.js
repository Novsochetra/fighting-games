import { clamp01 } from '../duel/hash.js';
import { columnOf } from './dive-figure.js';
import { DIVE_BEATS } from './dive-frames.js';
import { ballAtPlay } from './flight.js';
import { keeperPose } from './keeper-pose.js';
import { contactTick } from './timing.js';
import { DEPTH, GOAL_SIZE, project } from './view.js';

// A goal close to the keeper beats him under his stretch, and once he lies down his landing would
// cover the ball in the net. One that comes in over him is held there, slipping down no further
// than leaves it showing over him; a low one he lands on rolls on along the foot of the net, away
// from him, to the nearest place his landing leaves it showing. So the goal always reads. `HALF`
// is the net ball's half width with its shade and a pixel clear round it, in art pixels
const ROLL = { from: 4, to: 16 };
const HALF = 6;
const IN_NET = { from: 10, to: 60 };
const STILL = { roll: 0, floor: Infinity };
const kept = new WeakMap();

// the pixels his landing frame covers
function coverOf(pose) {
  const { figure: map, mirror } = pose;
  const left = pose.x - columnOf(map, map.anchor.x, mirror);
  const top = pose.y - map.anchor.y;

  return (x, y) => {
    const letter = map.rows[y - top]?.[columnOf(map, x - left, mirror)];

    return letter !== undefined && letter !== '.';
  };
}

const around = (from, to = from) => ({
  top: Math.round(from) - HALF,
  bottom: Math.round(to) + HALF,
});

// how many of the pixels round the ball at `x`, over `rows`, his landing covers
function coveredAt(covered, x, rows) {
  let count = 0;

  for (let y = rows.top; y <= rows.bottom; y += 1) {
    for (let column = Math.round(x) - HALF; column <= Math.round(x) + HALF; column += 1) {
      count += covered(column, y) ? 1 : 0;
    }
  }

  return count;
}

// the lowest the ball slips to before his landing would cover any of it
function floorOf(covered, { at, rest }) {
  for (let y = Math.round(at.y); y <= Math.round(rest.y); y += 1) {
    if (coveredAt(covered, at.x, around(y)) > 0) {
      return y - 1;
    }
  }

  return Infinity;
}

// the shortest roll away from him to where he covers least of it, at best none, no further than
// the post: a ball that rolled back behind him would only be lost again
function rollFrom(covered, { at, rest, away }) {
  const net = project({ x: 0, y: 0, z: DEPTH.net });
  const inside = GOAL_SIZE.halfWidth * net.scale - HALF;
  const rows = around(at.y, rest.y);
  const best = { step: 0, count: coveredAt(covered, at.x, rows) };

  for (let step = 1; best.count > 0 && Math.abs(at.x + away * step - net.x) <= inside; step += 1) {
    const count = coveredAt(covered, at.x + away * step, rows);

    if (count < best.count) {
      Object.assign(best, { step, count });
    }
  }

  return away * best.step;
}

function restOf(moment) {
  if (moment.outcome !== 'goal' || !moment.dive) {
    return STILL;
  }

  const landing = keeperPose(moment, contactTick() + DIVE_BEATS.land);
  const covered = coverOf(landing);
  const [at, rest] = [IN_NET.from, IN_NET.to].map((since) =>
    project(ballAtPlay(moment, contactTick() + since)),
  );

  if (coveredAt(covered, at.x, around(at.y)) === 0) {
    return { roll: 0, floor: floorOf(covered, { at, rest }) };
  }

  const away = Math.sign(at.x - landing.x) || moment.dive;

  return { roll: rollFrom(covered, { at, rest, away }), floor: Infinity };
}

// how far across the ball in the net rolls once in it, and the lowest it slips to, in art pixels,
// worked out once a moment
export function netRestOf(moment) {
  if (!kept.has(moment)) {
    kept.set(moment, restOf(moment));
  }

  return kept.get(moment);
}

// a point of the ball's way at the play tick `play`: once it is in the net, rolled on as far as it
// has gone by then and held over the keeper
export function rested(point, { roll, floor }, play) {
  const since = play - contactTick();

  if (since < ROLL.from || (!roll && floor === Infinity)) {
    return point;
  }

  const share = clamp01((since - ROLL.from) / (ROLL.to - ROLL.from));

  return {
    ...point,
    x: point.x + roll * share * share * (3 - 2 * share),
    y: Math.min(point.y, floor),
  };
}
