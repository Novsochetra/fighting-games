import { GROUND_Y } from '../../config.js';
import { hashInt } from '../../lib/math.js';

const WIDTH = 640;

function ridgeHeight(x) {
  const angle = (x / WIDTH) * Math.PI * 2;
  const height =
    46 +
    16 * Math.sin(angle * 2 + 1) +
    10 * Math.sin(angle * 5 + 0.3) +
    5 * Math.sin(angle * 11 + 2);
  return Math.round(height / 7) * 7;
}

function paintColumn(context, x, colors) {
  const height = ridgeHeight(x);
  context.fillStyle = colors.body;
  context.fillRect(x, GROUND_Y - height, 1, height);
  context.fillStyle = colors.ridge;
  context.fillRect(x, GROUND_Y - height, 1, 1);
  context.fillStyle = colors.speck;
  for (let y = GROUND_Y - height + 6; y < GROUND_Y; y += 9) {
    if (hashInt(x * 7 + y) % 5) {
      context.fillRect(x, y, 1, 1);
    }
  }
}

export function buildHills(createCanvas, colors) {
  const canvas = createCanvas(WIDTH, GROUND_Y);
  const context = canvas.getContext('2d');
  for (let x = 0; x < WIDTH; x++) {
    paintColumn(context, x, colors);
  }
  context.fillStyle = colors.haze;
  context.fillRect(0, GROUND_Y - 24, WIDTH, 24);
  return canvas;
}
