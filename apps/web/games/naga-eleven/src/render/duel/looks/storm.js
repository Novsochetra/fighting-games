import { hash } from '../hash.js';
import { disc } from '../shapes.js';

// a bank of storm cloud rolling across the top of a box, lit from above in its own colours
export function drawStormCloud(pen, { left, width, top, art, tick, depth = 18 }) {
  const ramp = [art.sky[0], art.sky[1], art.accent[0], art.accent[1]];

  for (let layer = 0; layer < 3; layer += 1) {
    for (let i = 0; i < width / 10 + 2; i += 1) {
      const x =
        left +
        ((i * 13 + tick * (0.3 + layer * 0.2) + hash(i, layer, 181) * 9) % (width + 20)) -
        10;
      const y = top + depth * (0.3 + layer * 0.25) + hash(i, layer, 182) * 4;
      const radius = 7 + hash(i, layer, 183) * 6 - layer;

      disc(pen, { x, y, radius, color: ramp[layer] });
      disc(pen, { x: x - 1, y: y - radius * 0.45, radius: radius * 0.55, color: ramp[layer + 1] });
    }
  }
}
