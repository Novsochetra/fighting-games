import { clamp } from '../../lib/math.js';
import { shiftRows } from './shift-rows.js';

const ROW_RATE = 0.8;
const SPEED = 0.025;
const UNDERTOW_RATE = 0.29;
const UNDERTOW_SPEED = 0.013;
// the far water by the shore barely stirs
const CALM = 0.4;

// how far a row of the moat sways, in whole pixels: a slow swell runs down the rows toward the
// near bank, with a slower one under it so the pattern never quite repeats, and it grows with
// how near the row is
export function rippleOffset(ripple, y, tick) {
  const depth = clamp((y - ripple.top) / (ripple.bottom - ripple.top), 0, 1);
  const swell =
    Math.sin(y * ROW_RATE - tick * SPEED) * 0.7 +
    Math.sin(y * UNDERTOW_RATE + tick * UNDERTOW_SPEED) * 0.3;
  return Math.round(swell * (CALM + depth * ripple.reach)) || 0;
}

// the reflection in each stretch of open water sways, row by row
export function drawRipple(painter, { effect, tick, painting }) {
  const offsetAt = (y) => rippleOffset(effect, y, tick);
  for (const area of effect.areas) {
    shiftRows(painter.context, { painting, area, offsetAt });
  }
}
