import { drawRasterRuns } from '../../backdrops/blit.js';
import { ART } from '../../duel/layout.js';
import { defaultCanvas } from '../../venues/kit/canvas.js';
import { packed } from '../../venues/kit/colour.js';
import { createRaster } from '../../venues/kit/raster.js';

// A beast of thousands of rects (the Seven-Headed Naga is up to 14,000 a frame) is drawn on a
// sheet of the art grid in plain JavaScript, then laid on the canvas in one call; every rect lands
// where the canvas pen would put it, so the picture is the same. The sheet runs past the view's
// edge by `MARGIN`, as a shaken view shows a strip beyond it
const MARGIN = 16;

const extend = (box, { left, top, right, bottom }) => {
  box.left = Math.min(box.left, left);
  box.top = Math.min(box.top, top);
  box.right = Math.max(box.right, right);
  box.bottom = Math.max(box.bottom, bottom);
};

const emptyBox = () => ({ left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });

// a pen of art pixels on a raster that rounds as the canvas pen does; `offset` is the raster pixel
// the art grid's (0, 0) lands on, and `box` grows round all it draws
export function rasterPen(raster, offset = { x: 0, y: 0 }) {
  const box = emptyBox();

  function rect([left, top, width, height], color) {
    const fromX = Math.max(0, Math.round(left) + offset.x);
    const fromY = Math.max(0, Math.round(top) + offset.y);
    const toX = Math.min(raster.width, Math.round(left + width) + offset.x);
    const toY = Math.min(raster.height, Math.round(top + height) + offset.y);

    if (toX <= fromX || toY <= fromY || !color) {
      return;
    }

    const colour = packed(color);

    for (let row = fromY; row < toY; row += 1) {
      raster.pixels.fill(colour, row * raster.width + fromX, row * raster.width + toX);
    }

    extend(box, { left: fromX, top: fromY, right: toX, bottom: toY });
  }

  const cover = (area) => extend(box, area);

  return {
    raster,
    offset,
    box,
    unit: 1,
    rect,
    cover,
    dot: (x, y, color) => rect([x, y, 1, 1], color),
  };
}

const sheet = { raster: null, image: null, canvas: null, context: null };

// one sheet for every frame, its pixels the ImageData's own, so laying it down copies nothing; a
// page canvas with no 2D context (a test's DOM) lays it down in runs
function sheetRaster() {
  if (!sheet.raster) {
    const width = ART.width + MARGIN * 2;
    const height = ART.height + MARGIN * 2;
    const canvas = defaultCanvas(width, height);

    sheet.context = canvas?.getContext('2d') ?? null;
    sheet.canvas = sheet.context ? canvas : null;
    sheet.image = sheet.context?.createImageData(width, height) ?? null;
    sheet.raster = sheet.image
      ? { width, height, data: sheet.image.data, pixels: new Uint32Array(sheet.image.data.buffer) }
      : createRaster(width, height);
  }

  sheet.raster.pixels.fill(0);

  return sheet.raster;
}

function layDown(pen, { raster, box }) {
  const { context, origin, unit } = pen;
  const at = (value, base) => base + (value - MARGIN) * unit;

  if (!sheet.canvas) {
    drawRasterRuns(context, raster, { x: at(0, origin.x), y: at(0, origin.y), scale: unit });

    return;
  }

  const [width, height] = [box.right - box.left, box.bottom - box.top];

  sheet.context.putImageData(sheet.image, 0, 0, box.left, box.top, width, height);
  context.imageSmoothingEnabled = false;
  context.drawImage(
    sheet.canvas,
    ...[box.left, box.top, width, height],
    ...[at(box.left, origin.x), at(box.top, origin.y), width * unit, height * unit],
  );
}

// `draw(pen)` on the sheet, then the sheet on `pen`'s canvas; a pen that clips or stands in for a
// canvas is drawn on as it is
export function drawOnSheet(pen, draw) {
  if (!pen.context || pen.shifted) {
    draw(pen);

    return;
  }

  const sheetPen = rasterPen(sheetRaster(), { x: MARGIN, y: MARGIN });

  draw(sheetPen);

  if (sheetPen.box.right > sheetPen.box.left) {
    layDown(pen, sheetPen);
  }
}
