import { COLORS } from '../../../art/colors.js';
import { PROP_COLORS } from '../../../art/prop-colors.js';
import { point } from '../../painter.js';

const PALM = PROP_COLORS.palm;
const FROND_ANGLES = [-2.8, -2.2, -1.4, -0.7, 0.1, 0.6];

function frondPoints(crown, angle) {
  const points = [];
  let x = crown.x;
  let y = crown.y;
  for (let step = 0; step < 16; step++) {
    x += Math.cos(angle) * 1.3;
    y += Math.sin(angle) * 1.3 + step * 0.1;
    points.push(point(x, y));
  }
  return points;
}

function drawFrond(painter, points) {
  for (let i = 1; i < points.length; i++) {
    painter.use(COLORS.outline).line(points[i - 1], points[i], 4);
  }
  for (let i = 1; i < points.length; i++) {
    painter.use(i % 2 ? PALM.leaf : PALM.leafLight).line(points[i - 1], points[i], 2);
  }
}

export function drawPalm(painter, x, y) {
  for (let i = 0; i < 13; i++) {
    const trunkX = x + Math.round(Math.sin(i * 0.22) * 4);
    painter.use(COLORS.outline).rect(trunkX - 1, y - 6 - i * 5, 6, 6);
    painter.use(i % 2 ? PALM.bark : PALM.barkLight).rect(trunkX, y - 5 - i * 5, 4, 5);
  }
  const crown = point(x + Math.round(Math.sin(12 * 0.22) * 4) + 2, y - 70);
  for (const angle of FROND_ANGLES) {
    drawFrond(painter, frondPoints(crown, angle));
  }
  painter.use(PALM.crown).rect(crown.x - 2, crown.y - 1, 5, 4);
}
