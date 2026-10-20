import { VIEW_HEIGHT } from '../../../config.js';

// a fern clump in the forests: blades fan out from one root and nod in the wind
export function drawFern(painter, x, { hash, colors, tick }) {
  const blades = 5 + (hash % 4);
  const nod = Math.round(Math.sin(tick / 50 + hash) * 1.5);
  for (let i = 0; i < blades; i++) {
    const height = 6 + ((hash >>> i) % 9);
    const spread = (i - blades / 2) * 3;
    painter.use(i % 2 ? colors.fern : colors.fernLight);
    painter.rect(x + spread, VIEW_HEIGHT - height + 2, 2, height);
    painter.rect(x + spread * 1.4 + nod, VIEW_HEIGHT - height, 2, 3);
  }
}
