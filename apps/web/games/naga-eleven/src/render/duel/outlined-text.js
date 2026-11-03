import { DUEL_INK } from '../../art/duel/palette.js';
import { drawText } from '../text.js';

const AROUND = [
  [-2, 0],
  [2, 0],
  [0, -2],
  [0, 2],
  [-2, -2],
  [2, -2],
  [-2, 2],
  [2, 2],
];

// a line of the device's own face, ringed in ink so it reads over a busy cut-in
export function drawOutlinedText(context, text, { x, y, size = 24, color, align = 'center' }) {
  for (const [dx, dy] of AROUND) {
    drawText(context, text, { x: x + dx, y: y + dy, color: DUEL_INK, align, size, weight: 700 });
  }

  drawText(context, text, { x, y, color, align, size, weight: 700 });
}
