import { clamp } from '../../sim/vector.js';
import { clampAlong, clampDepth } from './bounds.js';
import { FOCUS_ROW, groundAtRow, rowAt, scaleAt } from './lens.js';
import { HEAD_ROOM, rowsBetween } from './room.js';

// A broadcast camera holds still while the play stays inside a window in the middle of the view,
// and moves only as far as keeps it there, so a ball rolling a few steps back and forth or a short
// pass moves nothing. In canvas pixels: `side` from the view's middle, `up` and `down` from the row
// it looks at. The window is tall, so the view tilts only when the ball goes out toward a
// touchline, and its top is under the HUD, so the players there stand clear of it.
const ROWS = rowsBetween({ top: HEAD_ROOM + 20, bottom: 120 });

export const DEAD_ZONE = { side: 208, up: FOCUS_ROW - ROWS.top, down: ROWS.bottom - FOCUS_ROW };

export const holdInside = (held, point, reach) => clamp(held, point - reach, point + reach);

function aimDepth(camera, point) {
  const { lens } = camera;
  const row = rowAt(lens, point.y);
  const heldRow = rowAt(lens, camera.aim.y);
  const aimRow = clamp(heldRow, row - DEAD_ZONE.down, row + DEAD_ZONE.up);
  // a row turned back into a depth comes back a hair off, which would creep the held view
  const depth = aimRow === heldRow ? camera.aim.y : groundAtRow(lens, aimRow);

  return clampDepth(camera.bounds, depth);
}

// the aim is where the camera's springs head for; it stays inside the ground the camera may see,
// so a ball coming back from an end moves the view as soon as it leaves the window
export function stepAim(camera, point) {
  const y = aimDepth(camera, point);
  const reach = DEAD_ZONE.side / scaleAt(camera.lens, point.y);
  const x = holdInside(camera.aim.x, point.x, reach);

  camera.aim.y = y;
  camera.aim.x = clampAlong(camera.bounds, camera.lens, { x, y });
}

export function aimAt(camera, point) {
  const y = clampDepth(camera.bounds, point.y);

  camera.aim.y = y;
  camera.aim.x = clampAlong(camera.bounds, camera.lens, { x: point.x, y });
}

export function aimAtView(camera) {
  camera.aim.x = camera.along.value;
  camera.aim.y = camera.depth.value;
}
