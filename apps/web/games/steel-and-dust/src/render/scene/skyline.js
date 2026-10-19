import { SKYLINE_COLORS as SKYLINE } from '../../art/scene-colors.js';
import { GROUND_Y } from '../../config.js';
import { createRng, hashInt } from '../../lib/math.js';

const WIDTH = 768;

function paintWindows(context, { x, width, top }) {
  for (let y = top + 6; y < GROUND_Y - 8; y += 9) {
    for (let column = x + 4; column < x + width - 8; column += 7) {
      context.fillStyle = hashInt(column * 31 + y) % 17 === 0 ? SKYLINE.litWindow : SKYLINE.window;
      context.fillRect(column, y, 3, 4);
    }
  }
}

function paintBuilding(context, { x, width, height }) {
  const top = GROUND_Y - height;
  context.fillStyle = SKYLINE.wall;
  context.fillRect(x, top, width, height);
  context.fillStyle = SKYLINE.shade;
  context.fillRect(x + width - 4, top, 4, height);
  context.fillStyle = SKYLINE.roof;
  context.fillRect(x, top, width - 4, 1);
  for (let i = 0; i < width; i += 3) {
    const notch = hashInt(x * 13 + i) % 9;
    if (notch < 4) {
      context.fillStyle = SKYLINE.cutout;
      context.clearRect(x + i, top, 3, notch + 1);
    }
  }
  paintWindows(context, { x, width, top });
}

function paintBuildings(context) {
  const random = createRng(3);
  let x = 0;
  while (x < WIDTH) {
    const width = 24 + ((random() * 40) | 0);
    const height = 26 + ((random() * 54) | 0);
    paintBuilding(context, { x, width, height });
    if (x + width > WIDTH) {
      paintBuilding(context, { x: x - WIDTH, width, height });
    }
    x += width + 4 + ((random() * 18) | 0);
  }
}

function paintWaterTower(context) {
  const x = 420;
  context.fillStyle = SKYLINE.silhouette;
  context.fillRect(x, GROUND_Y - 96, 2, 50);
  context.fillRect(x + 18, GROUND_Y - 96, 2, 50);
  context.fillRect(x + 2, GROUND_Y - 70, 16, 1);
  context.fillStyle = SKYLINE.tank;
  context.fillRect(x - 3, GROUND_Y - 112, 26, 18);
  context.fillStyle = SKYLINE.tankRim;
  context.fillRect(x - 3, GROUND_Y - 112, 26, 2);
}

function paintPalm(context, trunkX) {
  context.fillStyle = SKYLINE.silhouette;
  for (let i = 0; i < 14; i++) {
    context.fillRect(trunkX + Math.round(Math.sin(i * 0.25) * 3), GROUND_Y - 8 - i * 5, 3, 6);
  }
  for (const angle of [-2.7, -2.1, -1.3, -0.5, 0.2]) {
    let x = trunkX + 3;
    let y = GROUND_Y - 80;
    for (let step = 0; step < 14; step++) {
      x += Math.cos(angle) * 1.2;
      y += Math.sin(angle) * 1.2 + step * 0.09;
      context.fillRect(Math.round(x), Math.round(y), 2, 2);
    }
  }
}

export function buildSkyline(createCanvas) {
  const canvas = createCanvas(WIDTH, GROUND_Y);
  const context = canvas.getContext('2d');
  paintBuildings(context);
  paintWaterTower(context);
  for (const x of [120, 600]) {
    paintPalm(context, x);
  }
  return canvas;
}
