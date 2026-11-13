import { ring } from '../../../../../../src/render/duel/shapes.js';
import { SHOT_ART } from '../../colors.js';

const RINGS = [
  { reach: 30, color: SHOT_ART.emerald[3], width: 2 },
  { reach: 22, color: SHOT_ART.gold[2], width: 1 },
  { reach: 14, color: SHOT_ART.emerald[4], width: 1 },
];

export function drawInrush(pen, { compress, ball }) {
  const x = Math.round(ball.x);
  const y = Math.round(ball.y);

  RINGS.forEach(({ reach, color, width }, i) => {
    const radius = Math.round(reach * (1 - compress)) + 6;

    if (compress >= i * 0.14) {
      ring(pen, { x: x + 0.5, y: y + 0.5, radius, width, color });
    }
  });
}
