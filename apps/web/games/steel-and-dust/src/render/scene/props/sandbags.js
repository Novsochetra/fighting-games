import { COLORS } from '../../../art/colors.js';
import { PROP_COLORS } from '../../../art/prop-colors.js';

const ROWS = [
  [0, 3],
  [5, 2],
  [10, 1],
];
const BAG = PROP_COLORS.sandbag;

export function drawSandbags(painter, x, y) {
  for (const [rise, count] of ROWS) {
    for (let i = 0; i < count; i++) {
      const left = x - (count * 11) / 2 + i * 11;
      const top = y - 6 - rise;
      painter.use(COLORS.outline).rect(left - 1, top - 1, 12, 7);
      painter.use(BAG.fill).rect(left, top, 10, 5);
      painter.use(BAG.light).rect(left, top, 10, 1);
      painter.use(BAG.dark).rect(left, top + 4, 10, 1);
    }
  }
}
