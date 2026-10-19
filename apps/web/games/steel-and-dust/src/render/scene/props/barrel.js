import { COLORS } from '../../../art/colors.js';
import { PROP_COLORS } from '../../../art/prop-colors.js';

const BARREL = PROP_COLORS.barrel;

export function drawBarrel(painter, x, y) {
  painter.use(COLORS.outline).rect(x - 6, y - 16, 12, 16);
  painter.use(BARREL.fill).rect(x - 5, y - 15, 10, 15);
  painter.use(BARREL.light).rect(x - 5, y - 15, 3, 15);
  painter.use(BARREL.band).rect(x - 5, y - 12, 10, 1);
  painter.use(BARREL.band).rect(x - 5, y - 5, 10, 1);
  painter.use(BARREL.rim).rect(x - 5, y - 15, 10, 1);
}
