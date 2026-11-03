import { clampAlong, clampDepth } from './bounds.js';
import { HARD, isInView } from './keep-in-view.js';
import { resetLead } from './lead.js';

// nothing in play flies this far in a tick (a shot at its hardest flies 17 units): the ball was
// set down somewhere new (the kick off after a goal, a goal kick) or the camera turned to the
// scorer
export const JUMP_DISTANCE = 60;

export const isJump = (from, to) =>
  Math.abs(to.x - from.x) + Math.abs(to.y - from.y) > JUMP_DISTANCE;

export function cutTo(camera, point) {
  const y = clampDepth(camera.bounds, point.y);
  const x = clampAlong(camera.bounds, camera.lens, { x: point.x, y });

  Object.assign(camera.aim, { x, y });
  Object.assign(camera.along, { value: x, velocity: 0 });
  Object.assign(camera.depth, { value: y, velocity: 0 });
  resetLead(camera.lead);
}

// a jump to somewhere out of the view is a new shot, as television cuts to it: a pan would sweep
// the whole ground, and the hold that keeps a ball in view would jerk the view half way there.
// A jump that lands anywhere in view is panned to as anything else is: a cut of a few steps
// reads as a stutter. Returns whether it cut.
export function cutOnJump(camera, point) {
  const { seen } = camera;
  const isCut = seen !== null && isJump(seen, point) && !isInView(camera, point, HARD);

  camera.seen = { x: point.x, y: point.y };

  if (isCut) {
    cutTo(camera, point);
  }

  return isCut;
}
