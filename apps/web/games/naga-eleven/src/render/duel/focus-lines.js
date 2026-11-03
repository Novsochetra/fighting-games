import { hash } from './hash.js';
import { ART } from './layout.js';
import { polygon } from './shapes.js';

const LINES = 44;

// the lines a comic draws toward what matters, flickering a little every other tick
export function drawFocusLines(pen, { centre, inner, color, tick, strength = 1 }) {
  const beat = Math.floor(tick / 2);

  for (let i = 0; i < LINES; i += 1) {
    if (hash(i, beat, 71) > strength) {
      continue;
    }

    const angle = ((i + hash(i, beat, 72) * 0.6) / LINES) * Math.PI * 2;
    const near = inner + hash(i, beat, 73) * 26;
    const width = 0.02 + hash(i, 74) * 0.03;
    const far = ART.width;

    polygon(
      pen,
      [
        [centre.x + Math.cos(angle) * near, centre.y + Math.sin(angle) * near],
        [centre.x + Math.cos(angle - width) * far, centre.y + Math.sin(angle - width) * far],
        [centre.x + Math.cos(angle + width) * far, centre.y + Math.sin(angle + width) * far],
      ],
      color,
    );
  }
}
