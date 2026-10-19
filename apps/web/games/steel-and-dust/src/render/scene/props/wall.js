import { COLORS } from '../../../art/colors.js';
import { PROP_COLORS } from '../../../art/prop-colors.js';

const WALL = PROP_COLORS.wall;

export function drawWall(painter, x, y) {
  painter.use(COLORS.outline).rect(x - 8, y - 100, 60, 100);
  painter.use(WALL.brick).rect(x - 7, y - 99, 58, 99);
  for (let row = 0; row < 20; row++) {
    for (let column = 0; column < 6; column++) {
      const color = row % 3 ? WALL.brickLight : WALL.brickDark;
      painter.use(color).rect(x - 7 + column * 10 + (row % 2) * 5, y - 99 + row * 5, 9, 4);
    }
  }
  for (let column = 0; column < 6; column++) {
    painter.use(WALL.brick).rect(x - 7 + column * 10, y - 106, 6, 7);
  }
}
