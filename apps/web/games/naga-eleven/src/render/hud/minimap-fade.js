import { UI_SCALE } from '../../config.js';
import { BALL } from '../../data/tuning.js';
import { clamp } from '../../sim/vector.js';
import { project } from '../camera.js';
import { minimapRect } from './layout.js';

// the minimap is glass over the foot of the view: while the ball or a goal (its posts, its net,
// the keeper in it) passes under it, it fades, by how near they come, so it never hides them
const FADE = { from: 56, faintest: 0.2 };

function worldRectOf(match) {
  const rect = minimapRect(match);

  return {
    left: rect.x * UI_SCALE,
    top: rect.y * UI_SCALE,
    right: (rect.x + rect.width) * UI_SCALE,
    bottom: (rect.y + rect.height) * UI_SCALE,
  };
}

const gapBetween = (first, second) =>
  Math.hypot(
    Math.max(0, first.left - second.right, second.left - first.right),
    Math.max(0, first.top - second.bottom, second.top - first.bottom),
  );

function goalBox(camera, { pitch, goal }, lineX) {
  const back = lineX === 0 ? -goal.depth : goal.depth;
  const corners = [lineX, lineX + back].flatMap((x) =>
    [-1, 1].flatMap((side) =>
      [0, goal.height].map((lift) =>
        project(camera, x, pitch.width / 2 + (side * goal.width) / 2, lift),
      ),
    ),
  );
  const xs = corners.map((point) => point.x);
  const ys = corners.map((point) => point.y);

  return {
    left: Math.min(...xs),
    right: Math.max(...xs),
    top: Math.min(...ys),
    bottom: Math.max(...ys),
  };
}

function ballBox(camera, ball) {
  const at = project(camera, ball.x, ball.y, Math.max(0, ball.z) + BALL.radius);

  return { left: at.x - 4, right: at.x + 4, top: at.y - 4, bottom: at.y + 4 };
}

export function minimapAlpha(camera, match) {
  const rect = worldRectOf(match);
  const boxes = [
    ballBox(camera, match.ball),
    ...[0, match.pitch.length].map((x) => goalBox(camera, match, x)),
  ];
  const nearest = Math.min(...boxes.map((box) => gapBetween(rect, box)));

  return FADE.faintest + (1 - FADE.faintest) * clamp(nearest / FADE.from, 0, 1);
}
