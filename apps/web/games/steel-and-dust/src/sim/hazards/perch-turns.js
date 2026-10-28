import { DROP } from '../../data/ambush.js';

const isOnPerch = (shot) => shot.kind === 'dropMark' && shot.perch && !shot.raider;

// how long until a raider on a perch, or waiting its turn on one, has leapt off it
const leavesIn = (mark) => (mark.delay ?? 0) + DROP.warn - mark.time;

const samePlace = (perch, other) => perch.spot === other.spot && perch.layerX === other.layerX;

// the perches raiders wait on now, or wait their turn on
export function perchesTaken(game) {
  return game.projectiles.filter(isOnPerch).map((mark) => mark.perch);
}

// with no room on any perch in sight, a raider waits its turn on the place the last of its queue
// leaps off soonest, the nearest x of those, and climbs on once that one has; null with no raider
// on a perch to follow
export function nextTurn(game, x) {
  const marks = game.projectiles.filter(isOnPerch);
  let best = null;

  for (const mark of marks) {
    const queue = marks.filter((other) => samePlace(other.perch, mark.perch));
    const free = Math.max(...queue.map(leavesIn));
    const near = Math.abs(mark.x - x);

    if (!best || free < best.free || (free === best.free && near < best.near)) {
      best = { perch: mark.perch, free, near };
    }
  }

  return best && { perch: best.perch, delay: best.free + DROP.turn };
}
