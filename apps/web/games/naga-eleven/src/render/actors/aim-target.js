import { AIM_MARKER } from '../../art/actors.js';
import { project } from '../camera.js';
import { drawnHeightOf } from './players.js';
import { drawPixelRing } from './shadow.js';
import { drawEdgePointer } from './steered-edge.js';

// The mate the human aims the keeper's pass or a goal kick at with the stick (`match.aimTarget`,
// a player's index, set by the sim while he aims) is marked apart from the steered player: a
// ring at his feet that pulses outward, a hollow diamond bobbing over his head and, while he is
// off the view, a pale arrow on its edge pointing to him.
const POINTER = { outline: AIM_MARKER.outline, tip: AIM_MARKER.fill[0], body: AIM_MARKER.fill[1] };
const OVER_HEAD = 8;
const DIAMOND = 4;

export const aimTargetOf = (match) => match.players[match.aimTarget ?? -1] ?? null;

export function drawAimRing(context, camera, { match, tick }) {
  const target = aimTargetOf(match);

  if (!target) {
    return;
  }

  const foot = project(camera, target.x, target.y);
  const pulse = Math.floor(tick / 6) % 4;

  context.fillStyle = AIM_MARKER.ring[1];
  drawPixelRing(context, {
    x: foot.x,
    y: foot.y + 1,
    radiusX: 12 * foot.scale,
    radiusY: 4.5 * foot.scale,
  });
  context.fillStyle = AIM_MARKER.ring[0];
  drawPixelRing(context, {
    x: foot.x,
    y: foot.y + 1,
    radiusX: (14 + pulse * 1.5) * foot.scale,
    radiusY: (5.5 + pulse * 0.5) * foot.scale,
  });
}

function drawDiamond(context, { x, top }) {
  for (let row = 0; row <= DIAMOND * 2; row += 1) {
    const half = DIAMOND - Math.abs(row - DIAMOND);

    context.fillStyle = AIM_MARKER.outline;
    context.fillRect(x - half - 1, top + row, half * 2 + 3, 1);
    context.fillStyle = row < DIAMOND ? AIM_MARKER.fill[0] : AIM_MARKER.fill[1];
    context.fillRect(x - half, top + row, half * 2 + 1, 1);

    if (half > 1) {
      context.fillStyle = AIM_MARKER.outline;
      context.fillRect(x - half + 2, top + row, half * 2 - 3, 1);
    }
  }
}

// in the world, over his head
export function drawAimMarker(context, camera, { match, tick, standHeight }) {
  const target = aimTargetOf(match);

  if (!target) {
    return;
  }

  const foot = project(camera, target.x, target.y);
  const bob = Math.floor(tick / 10) % 2;
  const height = drawnHeightOf(target, match, standHeight);
  const top = Math.round(foot.y) - height - OVER_HEAD - DIAMOND * 2 - bob;

  drawDiamond(context, { x: Math.round(foot.x), top });
}

// in the UI's space, on the edge of the view while he is out of it
export function drawAimEdge(context, camera, { match, tick, standHeight }) {
  const target = aimTargetOf(match);

  if (target) {
    drawEdgePointer(context, camera, {
      match,
      player: target,
      tick,
      standHeight,
      colours: POINTER,
    });
  }
}
