import { WORLD_VIEW } from '../../config.js';
import { clamp } from '../../sim/vector.js';
import { FOCUS_ROW, groundAtScale, scaleAt } from './lens.js';
import { rowsBetween } from './room.js';

// However fast a long ball flies, the camera keeps it in the view: past the soft margin it is
// drawn after the ball, gathering pace no faster than its springs may (motion.js), and held hard
// inside the narrow one, which a ball reaches only when the camera could not keep up. Canvas
// pixels from the view's sides; the rows the ball's spot keeps between.
export const SOFT = { side: 240, ...rowsBetween({ top: 40, bottom: 72 }) };
export const HARD = { side: 48, ...rowsBetween({ top: 0, bottom: 24 }) };
// the view's own edges: braking for the ends of its rail may let a ball into the hard margin,
// never off the screen
export const SCREEN = { side: 0, top: 0, bottom: WORLD_VIEW.height };
// the soft margin holds where a ball will be this many ticks on, so the faster it flies the
// sooner the camera sets off after it, and the less it has to hurry
const LOOK_AHEAD = 10;

export const aheadOf = (point) => ({
  x: point.x + (point.vx ?? 0) * LOOK_AHEAD,
  y: point.y + (point.vy ?? 0) * LOOK_AHEAD,
});

function keepAlong(camera, point, margin) {
  const reach = (WORLD_VIEW.width / 2 - margin.side) / scaleAt(camera.lens, point.y);

  return clamp(camera.along.value, point.x - reach, point.x + reach);
}

function keepDepth(camera, point, margin) {
  const { lens } = camera;
  const scale = scaleAt(lens, point.y);
  const nearest = groundAtScale(lens, scale + (FOCUS_ROW - margin.top) / lens.height);
  const farthest = groundAtScale(lens, scale - (margin.bottom - FOCUS_ROW) / lens.height);

  return clamp(camera.depth.value, farthest, nearest);
}

export const heldView = (camera, point, margin = SOFT) => ({
  along: keepAlong(camera, point, margin),
  depth: keepDepth(camera, point, margin),
});

export const isInView = (camera, point, margin = SOFT) => {
  const held = heldView(camera, point, margin);

  return held.along === camera.along.value && held.depth === camera.depth.value;
};

export function keepInView(camera, point, margin) {
  const held = heldView(camera, point, margin);

  camera.along.value = held.along;
  camera.depth.value = held.depth;
}
