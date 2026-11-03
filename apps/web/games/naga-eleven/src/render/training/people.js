import { COACH_MAP } from '../../art/training/coach.js';
import { SHADE } from '../../art/training/ground.js';
import { drawPixelMap } from './pixel-map.js';
import { faded, oval, paint } from './pixels.js';

export function drawShadow(context, { x, y, width = 9, alpha = 0.35 }) {
  faded(context, alpha, () => oval(context, SHADE, { x, y, radiusX: width, radiusY: 2 }));
}

const BLINK = { every: 230, ticks: 7 };

// Coach Vannak on the bench, his feet on the ground at x, y; now and then he blinks
export function drawCoach(context, { x, y, tick = 0 }) {
  drawPixelMap(context, COACH_MAP, { x, y });

  if (tick % BLINK.every >= BLINK.ticks) {
    return;
  }

  const { row, columns } = COACH_MAP.eyes;
  const left = Math.round(x) - COACH_MAP.anchor.x;
  const top = Math.round(y) - COACH_MAP.anchor.y + row;

  for (const column of columns) {
    paint(context, COACH_MAP.palette.A, [left + column, top, 1, 1]);
  }
}
