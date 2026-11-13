import { drawNagaHead } from '../../../../../../src/render/duel/looks/naga-head.js';
import { rasterPen } from '../../../../../../src/render/save-cam/trails/sheet.js';
import { createRaster } from '../../../../../../src/render/venues/kit/raster.js';
import { NAGA_ART } from '../../colors.js';

// a head reaches about 17 head sizes from its middle at most (its crest's flames)
const REACH = 64;

const MOST_KEPT = 40;

const kept = new Map();

const scratch = createRaster(REACH * 2, REACH * 2);

function painted({ size, angle }) {
  const pen = rasterPen(scratch, { x: REACH, y: REACH });

  drawNagaHead(pen, { x: 0, y: 0, size, facing: 1, angle, art: NAGA_ART });

  const { left, top, right, bottom } = pen.box;
  const width = Math.max(0, right - left);
  const height = Math.max(0, bottom - top);
  const pixels = new Uint32Array(width * height);

  for (let row = 0; row < height; row += 1) {
    const from = (top + row) * scratch.width + left;

    pixels.set(scratch.pixels.subarray(from, from + width), row * width);
  }

  scratch.pixels.fill(0);

  return { pixels, width, height, left: left - REACH, top: top - REACH };
}

// drawn once for each size and lean the flight passes through, in small steps, and stamped
export const quantizedHead = ({ size, angle }) => ({
  size: Math.round(size * 10) / 10,
  angle: Math.round(angle * 25) / 25,
});

export function headRaster(look) {
  const key = `${look.size}/${look.angle}`;

  if (!kept.has(key)) {
    if (kept.size >= MOST_KEPT) {
      kept.delete(kept.keys().next().value);
    }

    kept.set(key, painted(look));
  }

  return kept.get(key);
}

const opaque = (raster, x, y) =>
  x >= 0 && y >= 0 && x < raster.width && y < raster.height && raster.pixels[y * raster.width + x];

export const edgeOf = (raster, x, y) =>
  !opaque(raster, x - 1, y) ||
  !opaque(raster, x + 1, y) ||
  !opaque(raster, x, y - 1) ||
  !opaque(raster, x, y + 1);

// `recolour(word, x, y)` takes x and y in the head's own raster
export function stampHead(sheet, { head, at, recolour }) {
  const { raster, offset } = sheet;
  const left = at.x + head.left + offset.x;
  const top = at.y + head.top + offset.y;

  for (let row = Math.max(0, -top); row < Math.min(head.height, raster.height - top); row += 1) {
    for (
      let column = Math.max(0, -left);
      column < Math.min(head.width, raster.width - left);
      column += 1
    ) {
      const word = head.pixels[row * head.width + column];

      if (word !== 0) {
        raster.pixels[(top + row) * raster.width + left + column] = recolour
          ? recolour(word, column, row)
          : word;
      }
    }
  }

  sheet.cover({
    left: Math.max(0, left),
    top: Math.max(0, top),
    right: Math.min(raster.width, left + head.width),
    bottom: Math.min(raster.height, top + head.height),
  });
}
