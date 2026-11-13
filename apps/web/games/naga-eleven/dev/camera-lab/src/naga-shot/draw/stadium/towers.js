import { baked, stamp } from '../bake.js';
import { haloMargin, paintHalo } from './halo.js';
import { layerPen } from './layers.js';
import { LAMP_BY_DUSK, STEEL } from './palette.js';

const TOWERS = [236, 640];

const HEAD = { width: 25, height: 14, top: 88 };

const MAST = { top: 6, foot: 7, height: 90 };

const MARGIN = haloMargin();

const SIZE = { width: HEAD.width + MARGIN * 2, height: HEAD.height + MAST.height + MARGIN };

function paintMast(pen) {
  const middle = Math.floor(SIZE.width / 2);
  const top = MARGIN + HEAD.height;

  for (let y = top; y < SIZE.height; y += 1) {
    const share = (y - top) / MAST.height;
    const half = Math.round((MAST.top + (MAST.foot - MAST.top) * share) / 2);
    const zig = (y - top) % 10;
    const brace = Math.round(-half + ((zig < 5 ? zig : 10 - zig) / 5) * half * 2);

    pen.dot(middle - half, y, STEEL[1]);
    pen.dot(middle + half, y, STEEL[0]);
    pen.dot(middle + brace, y, STEEL[0]);
  }
}

function paintHead(pen, dusk) {
  const [core, rim] = LAMP_BY_DUSK[dusk];
  const box = { left: MARGIN, top: MARGIN, width: HEAD.width, height: HEAD.height };

  paintHalo(pen, { box, dusk });
  pen.rect([box.left, box.top, box.width, box.height], STEEL[0]);
  pen.rect([box.left, box.top, box.width, 1], STEEL[1]);
  pen.rect([box.left, box.top + box.height - 1, box.width, 1], STEEL[0]);

  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 6; column += 1) {
      const x = box.left + 1 + column * 4;
      const y = box.top + 2 + row * 4;

      pen.rect([x, y, 3, 3], rim);
      pen.rect([x, y, 2, 2], core);
    }
  }
}

const towerCanvas = (dusk) =>
  baked(`stadium-tower-${dusk}`, {
    ...SIZE,
    paint: (pen) => {
      paintMast(pen);
      paintHead(pen, dusk);
    },
  });

export function drawTowers(context, { camera, dusk }) {
  const pen = layerPen(context, camera, 'towers');
  const canvas = towerCanvas(dusk);

  TOWERS.forEach((x) => {
    const left = x - Math.floor(SIZE.width / 2);

    if (canvas) {
      stamp(pen, canvas, { left, top: HEAD.top - MARGIN });

      return;
    }

    pen.rect([x - 3, HEAD.top + HEAD.height, MAST.foot, MAST.height], STEEL[0]);
    pen.rect([x - 12, HEAD.top, HEAD.width, HEAD.height], LAMP_BY_DUSK[dusk][1]);
  });
}
