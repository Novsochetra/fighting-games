import { BALL_MARKER, MARKER } from '../../art/actors.js';
import { VIEW } from '../../config.js';
import { BALL } from '../../data/tuning.js';
import { clamp } from '../../sim/vector.js';
import { project } from '../camera.js';
import { toUiPoint } from '../spaces.js';
import { clearOfHud } from './hud-clear.js';

// a long ball climbs out over the top of the view for a moment, as on television; the ball itself
// and an arrow pinned to the top edge, at the HUD's scale, keep it in the player's eye until it
// drops back in
const TOP = 4;
const SIDE = 10;
const SIZE = BALL_MARKER.rows.length;

export const isAboveView = (camera, ball) =>
  project(camera, ball.x, ball.y, Math.max(0, ball.z) + BALL.radius).y < 0;

function drawBallMarker(context, { x, top }) {
  const left = x - Math.floor(SIZE / 2);

  BALL_MARKER.rows.forEach((row, y) => {
    [...row].forEach((code, column) => {
      if (code !== '.') {
        context.fillStyle = BALL_MARKER.colours[code];
        context.fillRect(left + column, top + y, 1, 1);
      }
    });
  });
}

function drawArrowDown(context, { x, top }) {
  for (let row = 0; row < 3; row += 1) {
    const half = 2 - row;

    context.fillStyle = MARKER.outline;
    context.fillRect(x - half - 1, top + row, half * 2 + 3, 1);
    context.fillStyle = MARKER.fill[2];
    context.fillRect(x - half, top + row, half * 2 + 1, 1);
  }
}

// drawn in the UI's space, over the world
export function drawBallAbove(context, camera, match) {
  const { ball } = match;

  if (!isAboveView(camera, ball)) {
    return;
  }

  const ground = toUiPoint(project(camera, ball.x, ball.y));
  const x = Math.round(clamp(ground.x, SIDE, VIEW.width - SIDE));
  const top = clearOfHud(match, { x, top: TOP, half: SIZE / 2 });

  drawBallMarker(context, { x, top });
  drawArrowDown(context, { x, top: top + SIZE + 2 });
}
