import { WORLD_VIEW } from '../../config.js';
import { clamp } from '../../sim/vector.js';
import { clampAlong, clampDepth } from './bounds.js';
import { FOCUS_ROW, groundAtRow, rowAt, scaleAt } from './lens.js';
import { HEAD_ROOM, rowsBetween } from './room.js';

// the player the human steers is framed with the ball when the view can hold both: the aim turns
// toward him only as far as keeps the ball this far inside the view (canvas pixels from its
// sides, the rows its spot keeps between), so a pass to someone off the side shows him before
// the ball arrives; his head stays clear of the HUD
const BALL_ROOM = { side: 300, ...rowsBetween({ top: 50, bottom: 140 }) };
const STEERED_ROOM = { side: 96, ...rowsBetween({ top: HEAD_ROOM, bottom: 48 }) };

const reachOf = (camera, point, side) =>
  (WORLD_VIEW.width / 2 - side) / scaleAt(camera.lens, point.y);

function rowsAround(camera, point, room) {
  const row = rowAt(camera.lens, point.y);

  return { low: row - (room.bottom - FOCUS_ROW), high: row + FOCUS_ROW - room.top };
}

function steerAlong(camera, ball, steered) {
  const ballReach = reachOf(camera, ball, BALL_ROOM.side);
  const steeredReach = reachOf(camera, steered, STEERED_ROOM.side);
  const toward = clamp(camera.aim.x, steered.x - steeredReach, steered.x + steeredReach);

  return clamp(toward, ball.x - ballReach, ball.x + ballReach);
}

function steerDepth(camera, ball, steered) {
  const ballRows = rowsAround(camera, ball, BALL_ROOM);
  const steeredRows = rowsAround(camera, steered, STEERED_ROOM);
  const aimRow = rowAt(camera.lens, camera.aim.y);
  const framedRow = clamp(
    clamp(aimRow, steeredRows.low, steeredRows.high),
    ballRows.low,
    ballRows.high,
  );

  return framedRow === aimRow ? camera.aim.y : groundAtRow(camera.lens, framedRow);
}

const steeredOf = (match) =>
  match.humanTeam === null || match.humanTeam === undefined
    ? null
    : (match.players[match.controlled ?? -1] ?? null);

export function frameSteered(camera, match) {
  const steered = steeredOf(match);

  if (!steered) {
    return;
  }

  const y = clampDepth(camera.bounds, steerDepth(camera, match.ball, steered));

  camera.aim.y = y;
  camera.aim.x = clampAlong(camera.bounds, camera.lens, {
    x: steerAlong(camera, match.ball, steered),
    y,
  });
}
