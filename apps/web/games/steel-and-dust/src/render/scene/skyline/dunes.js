import { GROUND_Y } from '../../../config.js';
import { hashInt } from '../../../lib/math.js';
import { SKYLINE_WIDTH as WIDTH } from './width.js';

const MESAS = [
  { x: 50, width: 80, height: 64 },
  { x: 330, width: 70, height: 88 },
  { x: 570, width: 110, height: 52 },
];

// whole sine periods across the canvas, so the dunes tile without a seam
function duneHeight(x) {
  const angle = (x / WIDTH) * Math.PI * 2;
  return Math.round(18 + 9 * Math.sin(angle * 3 + 0.6) + 5 * Math.sin(angle * 7 + 2.1));
}

function paintDunes(context, colors) {
  for (let x = 0; x < WIDTH; x++) {
    const top = GROUND_Y - duneHeight(x);
    context.fillStyle = colors.wall;
    context.fillRect(x, top, 1, GROUND_Y - top);
    context.fillStyle = colors.roof;
    context.fillRect(x, top, 1, 1);
  }
}

// flat-topped buttes that spread wider in ledges toward the ground, streaked by erosion
function paintMesa(context, { x, width, height }, colors) {
  const top = GROUND_Y - height;
  for (let ledge = 0; ledge < 4; ledge++) {
    const spread = ledge * 9;
    const ledgeTop = top + ledge * Math.round(height / 4);
    context.fillStyle = ledge % 2 ? colors.silhouette : colors.shade;
    context.fillRect(x - spread, ledgeTop, width + spread * 2, GROUND_Y - ledgeTop);
    context.fillStyle = colors.roof;
    context.fillRect(x - spread, ledgeTop, width + spread * 2, 1);
  }
  for (let i = 4; i < width - 4; i += 5) {
    if (hashInt(x * 7 + i) % 3 === 0) {
      context.fillStyle = colors.tank;
      context.fillRect(x + i, top + 3 + (hashInt(i + x) % 10), 1, 12);
    }
  }
}

function paintCactus(context, x, colors) {
  context.fillStyle = colors.silhouette;
  context.fillRect(x, GROUND_Y - 22, 3, 22);
  context.fillRect(x - 5, GROUND_Y - 14, 5, 2);
  context.fillRect(x - 5, GROUND_Y - 19, 2, 6);
  context.fillRect(x + 3, GROUND_Y - 11, 4, 2);
  context.fillRect(x + 6, GROUND_Y - 16, 2, 6);
}

export function paintDuneland(context, colors) {
  for (const mesa of MESAS) {
    paintMesa(context, mesa, colors);
  }
  paintDunes(context, colors);
  for (const x of [200, 470, 720]) {
    paintCactus(context, x, colors);
  }
}
