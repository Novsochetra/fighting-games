import { BALL, KEEPER, PLAYER } from '../../data/tuning.js';
import { climbsOutOfReach, predictBall } from '../flight.js';
import { insidePitch } from '../pitch.js';
import { sprintSpeedOf } from '../stats.js';
import { distance, lengthOf, ZERO } from '../vector.js';

const ARRIVED = 3;
const EASE_FROM = 24;
const LOOK_AHEAD = 90;
const STEP = 3;

export const standStill = () => ({ move: ZERO, sprint: false, action: null });

export const kick = (action) => ({ move: ZERO, sprint: false, action });

// slows into the spot rather than running past it
export function runTo(player, target, sprint = false) {
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const gap = lengthOf(dx, dy);

  if (gap < ARRIVED) {
    return standStill();
  }

  const ease = Math.min(1, gap / EASE_FROM);

  return { move: { x: (dx / gap) * ease, y: (dy / gap) * ease }, sprint, action: null };
}

// the ball's way ahead, every few ticks, with whether a keeper or anyone else can play it there:
// a keeper's arms reach high, anyone else heads a ball only on its way down
function pathOf(ball) {
  const path = [];

  for (let ticks = 0; ticks <= LOOK_AHEAD; ticks += STEP) {
    const spot = predictBall(ball, ticks);
    const vz = ball.vz - BALL.gravity * ticks;

    path.push({
      ...spot,
      ticks,
      byKeeper: spot.z < KEEPER.reachHeight,
      byAnyone: spot.z < PLAYER.headHeight && !climbsOutOfReach({ z: spot.z, vz, kick: ball.kick }),
    });
  }

  return path;
}

// every player looks along the same way in a tick, so it is worked out once for the ball as it is
const FIELDS = ['x', 'y', 'z', 'vx', 'vy', 'vz', 'kick'];
let lastPath = { from: {}, path: [] };

function sharedPathOf(ball) {
  if (FIELDS.some((field) => lastPath.from[field] !== ball[field])) {
    lastPath = { from: { ...ball }, path: pathOf(ball) };
  }

  return lastPath.path;
}

// the first spot on the ball's way the player can get to in time, low enough to play, and the
// ticks it takes them
export function interceptOf(match, player) {
  const pace = sprintSpeedOf(player);
  const path = sharedPathOf(match.ball);
  const keeper = player.role === 'keeper';

  for (const spot of path) {
    const playable = keeper ? spot.byKeeper : spot.byAnyone;

    if (playable && distance(player, spot) - PLAYER.reach <= pace * spot.ticks) {
      return { ...insidePitch(match, spot), ticks: spot.ticks };
    }
  }

  const last = insidePitch(match, path.at(-1));

  return { ...last, ticks: LOOK_AHEAD + distance(player, last) / pace };
}
