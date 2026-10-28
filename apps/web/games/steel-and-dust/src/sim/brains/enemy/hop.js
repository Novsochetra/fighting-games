import { jump } from '../../fighters/actions.js';
import { GRAVITY } from '../../fighters/physics.js';
import { dropThrough } from '../../fighters/terrain-motion.js';
import { STEP_UP } from '../../stage/terrain.js';

const HOP_VY = -5.8;
const HOP_SPEED = 1.4;
// a leap over a moat is the same hop thrown further, to clear the water from its very edge
const LEAP_SPEED = 2.2;
// the hop peaks 53px up; anything taller than this is left alone so a raider never hops at a
// ledge it cannot land on
export const HOP_REACH = 48;
// thinking ticks between two changes of level, so a raider never hops back and forth
export const HOP_WAIT = 50;

// the tick a hop has risen far enough to pass over a face `rise` tall (its top within a step),
// and the tick it comes back down to that height
export function hopTimes(rise) {
  let height = 0;
  let lift = -HOP_VY;
  let ticks = 0;
  let clear = 0;
  while (lift > 0 || height > rise) {
    lift -= GRAVITY;
    height += lift;
    ticks++;
    if (!clear && height >= rise - STEP_UP) {
      clear = ticks;
    }
  }
  return { clear, land: ticks };
}

// slow enough to come down on the spot `travel` away and, with a face in the way, to reach it
// only once high enough to pass over it
export function hopSpeed({ travel, faceGap, rise }) {
  const { clear, land } = hopTimes(rise);
  const overFace = faceGap === null ? Infinity : faceGap / (clear + 1);
  return Math.sign(travel) * Math.min(HOP_SPEED, Math.abs(travel) / land, overFace);
}

export function isResting(raider) {
  return raider.ai.hopWait > 0;
}

// `faceX` is where a face in the way begins, or null when the hop rises through a platform
export function hop(game, raider, { toX, faceX, rise }) {
  const travel = toX - raider.x;
  const faceGap = faceX === null ? null : Math.abs(faceX - raider.x);
  jump(game, raider, { vy: HOP_VY, vx: hopSpeed({ travel, faceGap, rise }) });
  raider.ai.hopWait = HOP_WAIT;
}

// a hop that comes down on the spot `toX` away at the height it left from, however far that is
export function leap(game, raider, toX) {
  const travel = toX - raider.x;
  const { land } = hopTimes(0);

  jump(game, raider, {
    vy: HOP_VY,
    vx: Math.sign(travel) * Math.min(LEAP_SPEED, Math.abs(travel) / land),
  });

  raider.ai.hopWait = HOP_WAIT;
}

export function drop(game, raider) {
  if (!dropThrough(game, raider)) {
    return false;
  }
  raider.ai.hopWait = HOP_WAIT;
  return true;
}
