import { RUBBLE_COLORS as RUBBLE } from '../../art/scene-colors.js';
import { VIEW_HEIGHT } from '../../config.js';
import { hashInt } from '../../lib/math.js';

// rubble in front of the fighters scrolls faster than the world, for depth
export function drawForeground(painter, cameraX) {
  const offset = cameraX * 1.25;
  const first = Math.floor(offset / 170) - 1;
  for (let i = first; i < Math.floor(offset / 170) + 4; i++) {
    const hash = hashInt(i + 500);
    if (hash % 3 === 0) {
      continue;
    }
    const x = i * 170 - offset + (hash % 60);
    const height = 4 + (hash % 5);
    painter.use(RUBBLE.rock).rect(x, VIEW_HEIGHT - height, 22 + (hash % 14), height);
    painter.use(RUBBLE.top).rect(x + 3, VIEW_HEIGHT - height - 2, 10, 3);
    painter.use(RUBBLE.glint).rect(x + 4, VIEW_HEIGHT - height - 2, 4, 1);
  }
}
