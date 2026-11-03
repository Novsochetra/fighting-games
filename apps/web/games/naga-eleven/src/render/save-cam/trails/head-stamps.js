import { drawNagaHead } from '../../duel/looks/naga-head.js';
import { createRaster } from '../../venues/kit/raster.js';
import { rasterPen } from './sheet.js';

// A head behind the front one is drawn once for its size, its lean, the way it faces and its
// move, then stamped wherever it stands: the two of a pair in the fan are the same head, and from
// the contact on the fan holds its size. The fan stands them on whole pixels, where a stamp lands
// just as a drawing of the head would. The last few are kept for each move; `REACH` is more than
// the furthest a head behind (at most about 2 of the front head's sizes) runs from where it stands
const KEEP = 12;
const REACH = 96;
const stores = new WeakMap();
const scratch = createRaster(REACH * 2, REACH * 2);

function stampOf({ size, facing, angle, art, far }) {
  const pen = rasterPen(scratch, { x: REACH, y: REACH });

  drawNagaHead(pen, { x: 0, y: 0, size, facing, angle, art, far });

  const { left, top, right, bottom } = pen.box;
  const width = Math.max(0, right - left);
  const rows = Array.from({ length: Math.max(0, bottom - top) }, (_, i) =>
    scratch.pixels.slice((top + i) * scratch.width + left, (top + i) * scratch.width + right),
  );

  scratch.pixels.fill(0);

  return { rows, width, x: left - REACH, y: top - REACH };
}

function storeOf(move) {
  if (!stores.has(move)) {
    stores.set(move, new Map());
  }

  return stores.get(move);
}

function keptStamp(head, move) {
  const store = storeOf(move);
  const key = `${head.size}:${head.facing}:${head.angle}:${head.far}`;

  if (!store.has(key)) {
    while (store.size >= KEEP) {
      store.delete(store.keys().next().value);
    }

    store.set(key, stampOf(head));
  }

  return store.get(key);
}

// a stamp's drawn pixels over the sheet's, clipped to it
function stampRow(raster, { pixels, left, row }) {
  const from = Math.max(0, -left);
  const to = Math.min(pixels.length, raster.width - left);

  for (let i = from; i < to; i += 1) {
    if (pixels[i] !== 0) {
      raster.pixels[row * raster.width + left + i] = pixels[i];
    }
  }
}

function stamp(pen, { rows, width, x, y }, at) {
  if (rows.length === 0) {
    return;
  }

  const { raster, offset } = pen;
  const left = at.x + x + offset.x;
  const top = at.y + y + offset.y;

  rows.forEach((pixels, i) => {
    if (top + i >= 0 && top + i < raster.height) {
      stampRow(raster, { pixels, left, row: top + i });
    }
  });
  pen.cover({
    left: Math.max(0, left),
    top: Math.max(0, top),
    right: Math.min(raster.width, left + width),
    bottom: Math.min(raster.height, top + rows.length),
  });
}

// a far head at whole pixels (`head.x`, `head.y`) in its art, which is made from `move`'s own
// colours; a pen that is not a sheet's draws it as it is
export function drawHeadStamp(pen, head, move) {
  if (!pen.raster) {
    drawNagaHead(pen, head);

    return;
  }

  stamp(pen, keptStamp(head, move), head);
}
