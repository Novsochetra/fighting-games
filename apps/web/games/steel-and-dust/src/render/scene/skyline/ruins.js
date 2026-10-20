import { GROUND_Y } from '../../../config.js';
import { hashInt } from '../../../lib/math.js';
import { SKYLINE_WIDTH as WIDTH } from './width.js';

const TOWERS = [150, 470, 690];

// a stepped pyramid far off, behind everything else
function paintPyramid(context, colors) {
  const centerX = 300;
  for (let step = 0; step < 12; step++) {
    const half = 110 - step * 9;
    context.fillStyle = step % 2 ? colors.shade : colors.silhouette;
    context.fillRect(centerX - half, GROUND_Y - 8 - step * 8, half * 2, 8);
  }
  context.fillStyle = colors.litWindow;
  context.fillRect(centerX - 2, GROUND_Y - 98, 4, 4);
}

function paintWall(context, colors) {
  const top = GROUND_Y - 30;
  context.fillStyle = colors.wall;
  context.fillRect(0, top, WIDTH, 30);
  context.fillStyle = colors.roof;
  for (let x = 0; x < WIDTH; x += 12) {
    context.fillRect(x, top - 5, 7, 5);
  }
  for (let x = 6; x < WIDTH; x += 24) {
    if (hashInt(x) % 3 === 0) {
      context.clearRect(x, top - 5, 10, 9 + (hashInt(x + 1) % 8));
    }
  }
}

function paintTower(context, x, colors) {
  const height = 64 + (hashInt(x) % 24);
  const top = GROUND_Y - height;
  context.fillStyle = colors.shade;
  context.fillRect(x, top, 26, height);
  context.fillStyle = colors.roof;
  for (let i = 0; i < 26; i += 7) {
    context.fillRect(x + i - 1, top - 5, 5, 5);
  }
  context.fillStyle = colors.litWindow;
  context.fillRect(x + 11, top + 14, 4, 6);
  context.fillStyle = colors.window;
  context.fillRect(x + 11, top + 34, 4, 6);
}

// broken columns standing in front of the wall
function paintColumns(context, colors) {
  for (let x = 30; x < WIDTH; x += 64) {
    const height = 30 + (hashInt(x * 3) % 34);
    context.fillStyle = colors.silhouette;
    context.fillRect(x, GROUND_Y - height, 9, height);
    context.fillRect(x - 2, GROUND_Y - height, 13, 3);
    context.fillStyle = colors.tankRim;
    context.fillRect(x + 2, GROUND_Y - height + 5, 1, height - 8);
  }
}

export function paintRuins(context, colors) {
  paintPyramid(context, colors);
  paintWall(context, colors);
  for (const x of TOWERS) {
    paintTower(context, x, colors);
  }
  paintColumns(context, colors);
}
