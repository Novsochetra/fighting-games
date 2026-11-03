import { CONE } from '../../../art/training/ground.js';
import { MANNEQUIN_MAP } from '../../../art/training/mannequin.js';
import { drawShadow } from '../people.js';
import { drawPixelMap } from '../pixel-map.js';
import { paint } from '../pixels.js';

// a cone, row by row from the tip: its half width and whether the row is the white band
const CONE_ROWS = [
  [0, false],
  [1, false],
  [1, false],
  [1, false],
  [2, true],
  [2, true],
  [3, false],
  [3, false],
  [4, false],
  [4, false],
];

// lit on the left, the right side turning to shade and then to the dark edge
function coneRow(context, { x, y, half, band }) {
  paint(context, band ? CONE.band : CONE.face, [x - half, y, half * 2 + 1, 1]);
  paint(context, band ? CONE.bandShade : CONE.shade, [
    x + Math.ceil(half / 2),
    y,
    half - Math.ceil(half / 2) + 1,
    1,
  ]);
  paint(context, band ? CONE.bandShade : CONE.dark, [x + half, y, 1, 1]);

  if (half > 0) {
    paint(context, band ? CONE.band : CONE.light, [x - half + (half > 2 ? 1 : 0), y, 1, 1]);
  }
}

export function drawCone(context, { x, y }) {
  const top = y - CONE_ROWS.length - 2;

  drawShadow(context, { x: x + 2, y, width: 7, alpha: 0.3 });
  CONE_ROWS.forEach(([half, band], i) => coneRow(context, { x, y: top + i, half, band }));
  paint(context, CONE.base, [x - 6, y - 2, 13, 2]);
  paint(context, CONE.shade, [x - 6, y - 2, 13, 1]);
  paint(context, CONE.face, [x - 6, y - 2, 4, 1]);
}

// knocked over, it lies along the grass with its tip away from the runner
export function drawFallenCone(context, { x, y }) {
  drawShadow(context, { x: x + 1, y: y + 1, width: 7, alpha: 0.25 });
  paint(context, CONE.base, [x - 5, y - 6, 2, 7]);
  paint(context, CONE.face, [x - 3, y - 5, 3, 5]);
  paint(context, CONE.band, [x, y - 4, 2, 4]);
  paint(context, CONE.face, [x + 2, y - 4, 2, 3]);
  paint(context, CONE.face, [x + 4, y - 3, 2, 2]);
  paint(context, CONE.light, [x - 3, y - 5, 7, 1]);
  paint(context, CONE.dark, [x - 3, y, 7, 1]);
}

// a yellow training dummy as tall as the boy, leaning a pixel each way a moment when bumped
export function drawMannequin(context, { x, y, rock = 0 }) {
  const lean = { x: rock, y: 0 };
  const still = { x: 0, y: 0 };

  drawShadow(context, { x: x + 3, y, width: 10, alpha: 0.3 });
  drawPixelMap(context, MANNEQUIN_MAP, {
    x,
    y,
    shift: (row) => (row < MANNEQUIN_MAP.base ? lean : still),
  });
}
