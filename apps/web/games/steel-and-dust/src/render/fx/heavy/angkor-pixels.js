import { PIXEL, snap } from '../fine-pixels.js';

// a diamond `radius` screen pixels out from its centre pixel, on the sprites' own pixel grid, in
// the context's color
export function fineDiamond(context, { x, y, radius }) {
  const left = snap(x);
  const top = snap(y);
  for (let row = -radius; row <= radius; row++) {
    const half = radius - Math.abs(row);
    context.fillRect(left - half * PIXEL, top + row * PIXEL, (half * 2 + 1) * PIXEL, PIXEL);
  }
}
