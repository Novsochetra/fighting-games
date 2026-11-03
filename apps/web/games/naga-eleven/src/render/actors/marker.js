import { MARKER } from '../../art/actors.js';
import { KICK } from '../../data/tuning.js';
import { project } from '../camera.js';
import { drawPixelRing } from './shadow.js';

const OVER_HEAD = 6;
const ARROW_ROWS = 5;
const CHARGE = { width: 22, height: 3 };

function drawArrow(context, { x, top }) {
  context.fillStyle = MARKER.outline;
  context.fillRect(x - ARROW_ROWS - 1, top - 1, ARROW_ROWS * 2 + 3, 2);

  for (let row = 0; row < ARROW_ROWS; row += 1) {
    const half = ARROW_ROWS - row;

    context.fillStyle = MARKER.outline;
    context.fillRect(x - half - 1, top + row, half * 2 + 3, 1);
    context.fillStyle = row === 0 ? MARKER.fill[3] : MARKER.fill[2];
    context.fillRect(x - half, top + row, half, 1);
    context.fillStyle = row === 0 ? MARKER.fill[2] : MARKER.fill[1];
    context.fillRect(x, top + row, half + 1, 1);
  }

  context.fillStyle = MARKER.outline;
  context.fillRect(x, top + ARROW_ROWS, 1, 1);
}

function drawCharge(context, { x, top }, charge) {
  const share = Math.min(1, charge / KICK.chargeTicks);
  const left = x - CHARGE.width / 2;
  const colour = MARKER.charge[Math.min(2, Math.floor(share * 3))];

  context.fillStyle = MARKER.outline;
  context.fillRect(left - 1, top - 1, CHARGE.width + 2, CHARGE.height + 2);
  context.fillStyle = MARKER.track;
  context.fillRect(left, top, CHARGE.width, CHARGE.height);
  context.fillStyle = colour;
  context.fillRect(left, top, Math.round(CHARGE.width * share), CHARGE.height);
}

export function drawMarker(context, camera, { player, tick, standHeight }) {
  const foot = project(camera, player.x, player.y);
  const bob = Math.floor(tick / 12) % 2;
  const place = { x: Math.round(foot.x), top: Math.round(foot.y) - standHeight - OVER_HEAD - bob };

  drawArrow(context, place);

  if (player.charge > 0) {
    drawCharge(context, { x: place.x, top: place.top - 7 }, player.charge);
  }
}

// a gold ring round the steered player's feet, under everyone, so they stand out in a crowd
export function drawFeetRing(context, camera, player) {
  const foot = project(camera, player.x, player.y);

  context.fillStyle = MARKER.fill[2];
  drawPixelRing(context, {
    x: foot.x,
    y: foot.y + 1,
    radiusX: 11 * foot.scale,
    radiusY: 4 * foot.scale,
  });
}
