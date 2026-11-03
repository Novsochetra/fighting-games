import { clamp } from '../../sim/vector.js';
import { clampAlong } from './bounds.js';

// the fastest pace from which shedding `most` a tick still stops within `distance`: the paces
// p, p - most, p - 2 most ... down to the last whole tick add up to it exactly, so a camera on this
// curve is still on it a tick later and never has to shed more than `most` at the end
export function stoppingPace(distance, most) {
  const ticks = Math.floor((Math.sqrt(1 + (8 * distance) / most) - 1) / 2);

  return distance / (ticks + 1) + (most * ticks) / 2;
}

// heading for its aim, the camera goes no faster than it can stop from by the aim, so it never
// runs past it and turns back
export function brakeForAim(step, { gap, most }) {
  const stopping = stoppingPace(Math.abs(gap), most);

  return Math.sign(step) === Math.sign(gap) ? clamp(step, -stopping, stopping) : step;
}

// how fast the camera may go toward an end of its rail `room` away, going at `speed` that way
function railCap({ room, speed }, { most, hardest }) {
  const space = Math.max(0, room);
  const even = speed === 0 ? 0 : (speed * speed) / (2 * space + speed);

  return Math.min(space, Math.max(stoppingPace(space, most), speed - clamp(even, most, hardest)));
}

// whatever pushes it, the camera goes no faster than it can stop from by the end of its rail,
// shedding `most` a tick, so it eases into the end of the pitch instead of stopping dead against
// it; one that comes in faster than that (a hard pan after a long ball brought it) sheds its pace
// evenly all the way in, as hard as it must up to `hardest`, never speeding up
export function brakeForRail(step, { from, pace, rail, most, hardest }) {
  const limits = { most, hardest };
  const high = railCap({ room: rail.high - from, speed: Math.max(0, pace) }, limits);
  const low = railCap({ room: from - rail.low, speed: Math.max(0, -pace) }, limits);

  return clamp(step, -low, high);
}

// the ends of the camera's rail: along, the same whatever depth it looks at (bounds.js)
export const railOf = (camera) => ({
  along: {
    low: clampAlong(camera.bounds, camera.lens, { x: -Infinity }),
    high: clampAlong(camera.bounds, camera.lens, { x: Infinity }),
  },
  depth: { low: camera.bounds.minY, high: camera.bounds.maxY },
});
