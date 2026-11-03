import { MOSS, NAGA, STONE } from '../../../art/training/temple.js';
import { ART_VIEW, noise, oval, paint } from '../pixels.js';

// the terrace he sits on and the stair down from it, between two naga balustrades
export const PLATFORM = { top: 134, seat: 146, front: 158 };
const STAIR = { left: 84, right: 300, step: 14, tread: 4 };
const JOINT = 24;

function drawBlocks(context, [left, top, width, height], seed) {
  paint(context, STONE.shade, [left, top, width, height]);
  paint(context, STONE.deep, [left, top + height - 1, width, 1]);

  for (let row = 0; row * 10 < height; row += 1) {
    const y = top + row * 10;

    paint(context, STONE.crack, [left, y, width, 1]);

    for (let x = left + ((row + seed) % 2) * (JOINT / 2); x < left + width; x += JOINT) {
      paint(context, STONE.crack, [x, y, 1, 10]);

      if (noise(x * 3 + row + seed) < 0.18) {
        paint(context, MOSS[noise(x + row) < 0.5 ? 0 : 1], [x - 2, y + 7, 5, 2]);
      }
    }
  }
}

function drawTread(context, [left, top, width]) {
  paint(context, STONE.top, [left, top, width, STAIR.tread]);
  paint(context, STONE.lit, [left, top, width, 1]);

  for (let x = left + 7; x < left + width; x += 31) {
    paint(context, STONE.glint, [x, top, 4, 1]);
  }
}

function drawStair(context) {
  const width = STAIR.right - STAIR.left;

  for (let i = 0; i < 5; i += 1) {
    const top = PLATFORM.front + i * STAIR.step;

    drawTread(context, [STAIR.left, top, width]);
    drawBlocks(context, [STAIR.left, top + STAIR.tread, width, STAIR.step - STAIR.tread], i);
  }
}

// seven hooded heads fanned over a plinth, as at the foot of a temple's stair, eyes lit by the dawn
const HEADS = [
  [-12, -1],
  [-9, -7],
  [-5, -11],
  [0, -13],
  [5, -11],
  [9, -7],
  [12, -1],
];

function drawHead(context, { x, y }) {
  paint(context, NAGA.deep, [x - 3, y - 3, 7, 7]);
  paint(context, NAGA.face, [x - 2, y - 2, 5, 5]);
  paint(context, NAGA.lit, [x - 2, y - 2, 3, 1]);
  paint(context, NAGA.lit, [x - 2, y - 1, 1, 2]);
  paint(context, NAGA.eye, [x - 1, y, 1, 1]);
  paint(context, NAGA.eye, [x + 1, y, 1, 1]);
}

function drawNaga(context, { x, y }) {
  const hood = { x, y: y - 22 };

  paint(context, STONE.deep, [x - 13, y - 5, 27, 9]);
  paint(context, STONE.top, [x - 13, y - 5, 27, 2]);
  oval(context, NAGA.deep, { x, y: hood.y - 2, radiusX: 17, radiusY: 14 });
  oval(context, NAGA.shade, { x, y: hood.y - 1, radiusX: 14, radiusY: 11 });
  paint(context, NAGA.deep, [x - 5, hood.y, 11, y - 5 - hood.y]);
  paint(context, NAGA.face, [x - 4, hood.y, 9, y - 5 - hood.y]);
  paint(context, NAGA.lit, [x - 4, hood.y, 2, y - 5 - hood.y]);

  for (let row = hood.y + 3; row < y - 6; row += 4) {
    paint(context, NAGA.shade, [x - 1, row, 3, 1]);
  }

  for (const [dx, dy] of HEADS) {
    drawHead(context, { x: hood.x + dx, y: hood.y + dy });
  }
}

// the serpent's body runs up the stair's edge to the terrace, scaled
function drawRail(context, x) {
  paint(context, NAGA.deep, [x - 4, PLATFORM.front - 2, 9, 186 - PLATFORM.front]);
  paint(context, NAGA.shade, [x - 3, PLATFORM.front - 2, 7, 186 - PLATFORM.front]);
  paint(context, NAGA.lit, [x - 3, PLATFORM.front - 2, 2, 186 - PLATFORM.front]);

  for (let row = PLATFORM.front + 2; row < 184; row += 5) {
    paint(context, NAGA.deep, [x, row, 2, 1]);
  }
}

export function drawSteps(context) {
  paint(context, STONE.top, [0, PLATFORM.top, ART_VIEW.width, PLATFORM.front - PLATFORM.top]);
  paint(context, STONE.lit, [0, PLATFORM.top, ART_VIEW.width, 1]);
  paint(context, STONE.face, [0, PLATFORM.seat, ART_VIEW.width, PLATFORM.front - PLATFORM.seat]);
  drawBlocks(context, [0, PLATFORM.front, STAIR.left, ART_VIEW.height - PLATFORM.front], 1);
  drawBlocks(
    context,
    [STAIR.right, PLATFORM.front, ART_VIEW.width - STAIR.right, ART_VIEW.height - PLATFORM.front],
    0,
  );
  drawStair(context);
  drawRail(context, STAIR.left - 4);
  drawRail(context, STAIR.right + 4);
  drawNaga(context, { x: STAIR.left - 4, y: 208 });
  drawNaga(context, { x: STAIR.right + 4, y: 208 });
}
