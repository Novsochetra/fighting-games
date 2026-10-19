import { COLORS } from '../../../art/colors.js';
import { PROP_COLORS } from '../../../art/prop-colors.js';
import { point } from '../../painter.js';

const TANK = PROP_COLORS.tank;

function drawTreads(painter, x, y) {
  painter.use(COLORS.outline).rect(x - 38, y - 10, 76, 10);
  painter.use(TANK.tread).rect(x - 37, y - 9, 74, 8);
  for (let i = 0; i < 7; i++) {
    painter.use(TANK.wheel).rect(x - 34 + i * 10, y - 7, 6, 5);
    painter.use(TANK.tread).rect(x - 33 + i * 10, y - 6, 4, 3);
  }
}

function drawHull(painter, x, y) {
  painter.use(COLORS.outline).rect(x - 34, y - 21, 68, 12);
  painter.use(TANK.hull).rect(x - 33, y - 20, 66, 10);
  painter.use(TANK.hullLight).rect(x - 33, y - 20, 66, 2);
  painter.use(TANK.plate).rect(x + 10, y - 18, 23, 8);
  painter.use(COLORS.outline).rect(x - 16, y - 30, 28, 10);
  painter.use(TANK.hull).rect(x - 15, y - 29, 26, 8);
  painter.use(TANK.hullLight).rect(x - 15, y - 29, 26, 2);
}

export function drawTank(painter, x, y) {
  drawTreads(painter, x, y);
  drawHull(painter, x, y);
  const barrelFrom = point(x + 11, y - 25);
  const barrelTo = point(x + 30, y - 37);
  painter.use(COLORS.outline).line(barrelFrom, barrelTo, 4);
  painter.use(TANK.plate).line(barrelFrom, barrelTo, 2);
  painter.use(TANK.tread).rect(x - 6, y - 28, 6, 3);
  painter.use(TANK.tread).rect(x - 28, y - 17, 8, 4);
  painter.use(TANK.tread).rect(x + 20, y - 15, 6, 3);
}
