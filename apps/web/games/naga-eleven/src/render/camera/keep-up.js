import { BALL } from '../../data/tuning.js';
import { clamp } from '../../sim/vector.js';
import { brakeForRail } from './brakes.js';
import { heldView } from './keep-in-view.js';
import { rowsBetween } from './room.js';

// how many ticks ahead the camera reads a ball's flight, and the margins (canvas pixels from the
// view's sides, the rows its spot keeps between) it keeps it inside: a little inside the hard
// ones of keep-in-view.js, so the camera's own pace keeps a flying ball in view, not their hold
const HORIZON = 45;
const KEEP = { side: 64, ...rowsBetween({ top: 16, bottom: 40 }) };

const isFlying = (ball) => (ball.z ?? 0) > 0 || (ball.vz ?? 0) > 0;

// where a ball goes in `ticks` ticks if nothing meets it, slowed by the air or the grass, and
// stopped where the ground around the pitch ends, as the sim stops one that went out
export function flightAt(ball, ticks, pitch) {
  const drag = isFlying(ball) ? BALL.airDrag : BALL.rollDrag;
  const share = (drag * (1 - drag ** ticks)) / (1 - drag);
  const x = ball.x + (ball.vx ?? 0) * share;
  const y = ball.y + (ball.vy ?? 0) * share;

  return {
    x: clamp(x, -BALL.runoff, pitch.length + BALL.runoff),
    y: clamp(y, -BALL.runoff, pitch.width + BALL.runoff),
  };
}

const onRail = (value, rail) => clamp(value, rail.low, rail.high);

// where the camera would be on each of the next HORIZON ticks if it kept its pace, braking calmly
// for the end of its rail as it does
function coastedPath(axis, { rail, calm }) {
  const path = [axis.value];
  let pace = axis.pace;

  for (let ticks = 1; ticks <= HORIZON; ticks += 1) {
    const from = path[ticks - 1];

    pace = brakeForRail(pace, { from, pace, rail, most: calm, hardest: calm });
    path.push(onRail(from + pace, rail));
  }

  return path;
}

// how far, along and in depth, the coasting camera would be in `ticks` ticks from where it must
// stand to keep the ball inside the margins; the ends of its rail show the goal and the ground
// behind it, so it never needs to go further
function shortfall({ camera, ball, rail, paths }, ticks) {
  const along = paths.along[ticks];
  const depth = paths.depth[ticks];
  const coasted = { lens: camera.lens, along: { value: along }, depth: { value: depth } };
  const held = heldView(coasted, flightAt(ball, ticks, camera.bounds), KEEP);

  return {
    along: Math.abs(onRail(held.along, rail.along) - along),
    depth: Math.abs(onRail(held.depth, rail.depth) - depth),
  };
}

// A long ball can fly faster than a calm camera gathers pace after it: the steady acceleration on
// each axis that keeps the ball's flight from getting any further outside the margins than it is
// now, over the next HORIZON ticks, so the camera sets off as the ball is struck and pans only as
// hard as it must, instead of being dragged after a ball reaching the edge. A ball standing still
// near the edge needs none: the calm pan brings it in. World units a tick, per tick; `calm` is
// how hard the camera brakes for the ends of its rail.
export function keepUpAcceleration({ camera, ball, rail, calm }) {
  const paths = {
    along: coastedPath(camera.along, { rail: rail.along, calm: calm.along }),
    depth: coastedPath(camera.depth, { rail: rail.depth, calm: calm.depth }),
  };
  const now = shortfall({ camera, ball, rail, paths }, 0);
  const most = { along: 0, depth: 0 };

  for (let ticks = 1; ticks <= HORIZON; ticks += 1) {
    const ahead = shortfall({ camera, ball, rail, paths }, ticks);
    const share = 2 / (ticks * (ticks + 1));

    most.along = Math.max(most.along, (ahead.along - now.along) * share);
    most.depth = Math.max(most.depth, (ahead.depth - now.depth) * share);
  }

  return most;
}
