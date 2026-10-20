import { VIEW_HEIGHT } from '../../../config.js';

export function drawRubble(painter, x, { hash, colors }) {
  const height = 4 + (hash % 5);
  painter.use(colors.rock).rect(x, VIEW_HEIGHT - height, 22 + (hash % 14), height);
  painter.use(colors.top).rect(x + 3, VIEW_HEIGHT - height - 2, 10, 3);
  painter.use(colors.glint).rect(x + 4, VIEW_HEIGHT - height - 2, 4, 1);
}
