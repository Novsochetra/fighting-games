import { BALL } from '../../art/training/people.js';
import { drawShadow } from './people.js';
import { oval, paint } from './pixels.js';

const ROLL_STEP = 3;

// the patches walk round the ball as it rolls; shade sits low on the right, away from the sun
export function drawBall(context, { x, y, radius = 3, travel = 0 }) {
  const left = Math.round(x);
  const top = Math.round(y);
  const roll = Math.floor(travel / ROLL_STEP) % 3;

  oval(context, BALL.outline, { x: left, y: top, radiusX: radius + 1 });
  oval(context, BALL.white, { x: left, y: top, radiusX: radius });

  if (radius >= 2) {
    paint(context, BALL.shade, [left, top + radius - 1, radius, 1]);
    paint(context, BALL.shade, [left + radius - 1, top, 1, radius - 1]);
  }

  const patch = Math.max(1, Math.round(radius / 2));

  paint(context, BALL.patch, [left - 1 + roll - Math.floor(patch / 2), top - 1, patch, patch]);

  if (radius >= 3) {
    paint(context, BALL.patch, [left + 2 - roll, top + 1, 1, 1]);
    paint(context, BALL.white, [left - radius + 1, top - radius + 1, 1, 1]);
  }
}

export function drawGroundBall(context, { x, y, height = 0, radius = 3, travel = 0 }) {
  drawShadow(context, { x, y: y + 1, width: radius + 1, alpha: Math.max(0.12, 0.4 - height / 60) });
  drawBall(context, { x, y: y - radius - height, radius, travel });
}
