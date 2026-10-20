import { GROUND_Y } from '../../../config.js';
import { createRng, hashInt } from '../../../lib/math.js';
import { SKYLINE_WIDTH as WIDTH } from './width.js';

const STACKS = [70, 96, 300, 520, 548, 700];

// sheds with a sawtooth roof, a few windows still lit
function paintShed(context, { x, width, height }, colors) {
  const top = GROUND_Y - height;
  context.fillStyle = colors.wall;
  context.fillRect(x, top, width, height);
  context.fillStyle = colors.roof;
  for (let i = 0; i < width; i += 12) {
    for (let rise = 0; rise < 8; rise++) {
      context.fillRect(x + i + rise, top - rise, 12 - rise, 1);
    }
  }
  for (let column = x + 4; column < x + width - 4; column += 9) {
    context.fillStyle = hashInt(column * 17) % 5 === 0 ? colors.litWindow : colors.window;
    context.fillRect(column, top + 8, 4, 3);
  }
}

function paintSheds(context, colors) {
  const random = createRng(5);
  let x = 0;
  while (x < WIDTH) {
    const width = 60 + ((random() * 60) | 0);
    const height = 22 + ((random() * 26) | 0);
    paintShed(context, { x, width, height }, colors);
    if (x + width > WIDTH) {
      paintShed(context, { x: x - WIDTH, width, height }, colors);
    }
    x += width + 10 + ((random() * 30) | 0);
  }
}

function paintStack(context, x, colors) {
  const height = 70 + (hashInt(x) % 40);
  context.fillStyle = colors.silhouette;
  context.fillRect(x, GROUND_Y - height, 8, height);
  context.fillStyle = colors.tankRim;
  context.fillRect(x - 1, GROUND_Y - height, 10, 3);
  context.fillRect(x, GROUND_Y - height + 14, 8, 2);
}

function paintCrane(context, x, colors) {
  context.fillStyle = colors.shade;
  context.fillRect(x, GROUND_Y - 110, 3, 110);
  context.fillRect(x - 30, GROUND_Y - 110, 80, 3);
  for (let i = 0; i < 80; i += 6) {
    context.fillRect(x - 30 + i, GROUND_Y - 107, 1, 3);
  }
  context.fillRect(x + 40, GROUND_Y - 107, 1, 30);
  context.fillStyle = colors.tank;
  context.fillRect(x + 37, GROUND_Y - 78, 7, 5);
}

export function paintFactory(context, colors) {
  paintCrane(context, 410, colors);
  for (const x of STACKS) {
    paintStack(context, x, colors);
  }
  paintSheds(context, colors);
}
