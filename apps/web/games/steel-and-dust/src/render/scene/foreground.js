import { VIEW_HEIGHT } from '../../config.js';
import { hashInt } from '../../lib/math.js';

function drawRubble(painter, x, { hash, colors }) {
  const height = 4 + (hash % 5);
  painter.use(colors.rock).rect(x, VIEW_HEIGHT - height, 22 + (hash % 14), height);
  painter.use(colors.top).rect(x + 3, VIEW_HEIGHT - height - 2, 10, 3);
  painter.use(colors.glint).rect(x + 4, VIEW_HEIGHT - height - 2, 4, 1);
}

// a fern clump in the forests: blades fan out from one root and nod in the wind
function drawFern(painter, x, { hash, colors, tick }) {
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

// what lies in front of the fighters scrolls faster than the world, for depth
export function drawForeground(painter, cameraX, colors, tick) {
  const offset = cameraX * 1.25;
  const first = Math.floor(offset / 170) - 1;
  for (let i = first; i < Math.floor(offset / 170) + 4; i++) {
    const hash = hashInt(i + 500);
    if (hash % 3 === 0) {
      continue;
    }
    const x = i * 170 - offset + (hash % 60);
    if (colors.fern) {
      drawFern(painter, x, { hash, colors, tick });
    } else {
      drawRubble(painter, x, { hash, colors });
    }
  }
}
