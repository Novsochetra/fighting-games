import { MARKER } from '../../art/actors.js';
import { VIEW } from '../../config.js';
import { clamp } from '../../sim/vector.js';
import { project } from '../camera.js';
import { toUiPoint } from '../spaces.js';
import { clearOfHud } from './hud-clear.js';

// the steered player can run out of the view while the camera keeps the ball, mid-pass or on a
// cross-field ball; a gold arrow on the edge he went past, at the HUD's scale and clear of its
// boxes, points the player back to him
const EDGE = 10;
const SIZE = 8;

const POINTS = {
  left: (row) => ({ x: row, y: -row, width: 1, height: row * 2 + 1 }),
  right: (row) => ({ x: -row, y: -row, width: 1, height: row * 2 + 1 }),
  up: (row) => ({ x: -row, y: row, width: row * 2 + 1, height: 1 }),
  down: (row) => ({ x: -row, y: -row, width: row * 2 + 1, height: 1 }),
};

// in the UI's pixels
export function edgeOf(spot) {
  if (spot.x < 0) {
    return 'left';
  }

  if (spot.x > VIEW.width) {
    return 'right';
  }

  if (spot.y < 0) {
    return 'up';
  }

  return spot.y > VIEW.height ? 'down' : null;
}

const STEERED = { outline: MARKER.outline, tip: MARKER.fill[3], body: MARKER.fill[2] };

function drawPointer(context, { x, y, edge, colours }) {
  const line = POINTS[edge];

  for (let row = 0; row < SIZE; row += 1) {
    const span = line(row);

    context.fillStyle = colours.outline;
    context.fillRect(x + span.x - 1, y + span.y - 1, span.width + 2, span.height + 2);
  }

  for (let row = 0; row < SIZE - 1; row += 1) {
    const span = line(row);

    context.fillStyle = row < 2 ? colours.tip : colours.body;
    context.fillRect(x + span.x, y + span.y, span.width, span.height);
  }
}

// the arrow's tip sits on the edge, level with the player, and bobs as his own marker does, in
// `colours` ({ outline, tip, body })
export function drawEdgePointer(context, camera, { match, player, tick, standHeight, colours }) {
  const foot = project(camera, player.x, player.y);
  const middle = toUiPoint({ x: foot.x, y: foot.y - standHeight / 2 });
  const edge = edgeOf(middle);

  if (!edge) {
    return;
  }

  const bob = Math.floor(tick / 12) % 2;
  const inward = { left: [1, 0], right: [-1, 0], up: [0, 1], down: [0, -1] }[edge];
  const x = Math.round(clamp(middle.x, EDGE, VIEW.width - EDGE) + inward[0] * bob);
  const tip = Math.round(clamp(middle.y, EDGE, VIEW.height - EDGE) + inward[1] * bob);
  const reach = edge === 'up' ? 0 : SIZE;

  drawPointer(context, {
    x,
    y: clearOfHud(match, { x, top: tip - reach, half: SIZE }) + reach,
    edge,
    colours,
  });
}

export const drawSteeredEdge = (context, camera, options) =>
  drawEdgePointer(context, camera, { ...options, colours: STEERED });
