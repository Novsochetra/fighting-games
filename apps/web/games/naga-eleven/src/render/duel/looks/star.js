import { DUEL_INK } from '../../../art/duel/palette.js';

// a little five-point star of a cartoon, outlined, `size` art pixels from its middle to a point
export function drawStar(pen, { x, y, size, art }) {
  const cx = Math.round(x);
  const cy = Math.round(y);

  pen.rect([cx - 1, cy - size - 1, 3, size * 2 + 3], DUEL_INK);
  pen.rect([cx - size - 1, cy - 1, size * 2 + 3, 3], DUEL_INK);
  pen.rect([cx, cy - size, 1, size * 2 + 1], art.accent[3]);
  pen.rect([cx - size, cy, size * 2 + 1, 1], art.accent[3]);
  pen.rect([cx - 1, cy - 1, 3, 3], art.accent[2]);
  pen.dot(cx, cy, art.body[4]);
}
