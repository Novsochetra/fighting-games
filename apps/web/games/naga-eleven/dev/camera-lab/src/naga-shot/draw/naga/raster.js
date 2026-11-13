import { rasterPen } from '../../../../../../src/render/save-cam/trails/sheet.js';
import { createRaster } from '../../../../../../src/render/venues/kit/raster.js';
import { NAGA_ART } from '../../colors.js';
import { paintCrest, paintFigure, paintHead } from './figure.js';

// room round the figure for the light it gives off
export const MARGIN = 4;

// in head sizes round the middle of the head, more than any part of it reaches; the figure's
// body runs down deep under the ground
const REACHES = {
  figure: { left: 40, top: 19, right: 21, bottom: 56 },
  head: { left: 19, top: 19, right: 21, bottom: 16 },
};

const PAINTS = {
  figure: (pen, { size, gape }) => paintFigure(pen, { size, gape }),
  head: (pen, { size, gape }) => paintHead(pen, { size, gape, art: NAGA_ART }),
};

const kept = new Map();

const MOST_KEPT = 32;

function cropped(scratch, { box, offset }) {
  const [left, top] = [box.left - MARGIN, box.top - MARGIN];
  const width = box.right - box.left + MARGIN * 2;
  const height = box.bottom - box.top + MARGIN * 2;
  const pixels = new Uint32Array(width * height);

  for (let row = Math.max(0, -top); row < Math.min(height, scratch.height - top); row += 1) {
    for (
      let column = Math.max(0, -left);
      column < Math.min(width, scratch.width - left);
      column += 1
    ) {
      pixels[row * width + column] = scratch.pixels[(top + row) * scratch.width + left + column];
    }
  }

  return { left: left - offset.x, top: top - offset.y, width, height, pixels };
}

// painted in plain JavaScript, as the save cam paints its beasts (save-cam/trails/sheet.js): a
// canvas fills thousands of rects far slower
function painted(kind, look) {
  const reach = REACHES[kind];
  const scratch = createRaster(
    Math.ceil((reach.left + reach.right) * look.size) + MARGIN * 2,
    Math.ceil((reach.top + reach.bottom) * look.size) + MARGIN * 2,
  );
  const offset = {
    x: Math.ceil(reach.left * look.size) + MARGIN,
    y: Math.ceil(reach.top * look.size) + MARGIN,
  };
  const pen = rasterPen(scratch, offset);

  PAINTS[kind](pen, look);

  return cropped(scratch, { box: pen.box, offset });
}

function keep(key, raster) {
  if (kept.size >= MOST_KEPT) {
    kept.delete(kept.keys().next().value);
  }

  kept.set(key, raster);

  return raster;
}

export function rasterOf(kind, look) {
  const key = `${kind}/${look.size}/${look.gape}`;

  return kept.get(key) ?? keep(key, painted(kind, look));
}

// the crest alone, laid out as the figure it belongs to, so a pixel of one is the same of the other
export function crestRaster(look) {
  const key = `crest/${look.size}/${look.gape}`;

  if (!kept.has(key)) {
    const { left, top, width, height } = rasterOf('figure', look);
    const raster = createRaster(width, height);

    paintCrest(rasterPen(raster, { x: -left, y: -top }), look);
    keep(key, { left, top, width, height, pixels: raster.pixels });
  }

  return kept.get(key);
}

export function derivedRaster(key, make) {
  return kept.get(key) ?? keep(key, make());
}
