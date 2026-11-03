import { DROP_MARKER } from '../../art/drop-marker.js';
import { clamp, lerp } from '../../sim/vector.js';
import { project } from '../camera.js';
import { dropSpotOf } from './drop-spot.js';
import { drawPixelRing } from './shadow.js';

// the ring is widest and faintest while the ball has this many ticks or more to fall, and closes
// to the ball's own size, bright, as it lands
const CLOSE_TICKS = 54;
const RADIUS = { wide: 18, near: 6 };
const ALPHA = { faint: 0.3, bright: 0.95 };
// the ground is seen at a slant, so a ring on it is this much flatter than wide
const FLAT = 0.42;
const CROSS = 2;

function drawCross(context, { x, y }) {
  const centreX = Math.round(x);
  const centreY = Math.round(y);

  context.fillRect(centreX - CROSS, centreY, CROSS * 2 + 1, 1);
  context.fillRect(centreX, centreY - 1, 1, 3);
}

function drawRingAndCross(context, { ring, colour, alpha }) {
  context.globalAlpha = alpha;
  context.fillStyle = colour;
  drawPixelRing(context, ring);
  drawCross(context, ring);
}

// a ring on the grass where a high ball will come down, closing in and brightening as it falls,
// over a dark copy a pixel lower that keeps it from washing out on bright grass
export function drawDropMarker(context, camera, match) {
  const spot = dropSpotOf(match);

  if (!spot) {
    return;
  }

  const ground = project(camera, spot.x, spot.y);
  const near = 1 - clamp(spot.ticks / CLOSE_TICKS, 0, 1);
  const radiusX = lerp(RADIUS.wide, RADIUS.near, near) * ground.scale;
  const ring = { x: ground.x, y: ground.y, radiusX, radiusY: Math.max(2, radiusX * FLAT) };
  const alpha = lerp(ALPHA.faint, ALPHA.bright, near);

  drawRingAndCross(context, {
    ring: { ...ring, y: ring.y + 1 },
    colour: DROP_MARKER.dark,
    alpha: alpha * 0.55,
  });
  drawRingAndCross(context, { ring, colour: DROP_MARKER.light, alpha });
  context.globalAlpha = 1;
}
