import { drawRasterRuns } from '../../../../../../src/render/backdrops/blit.js';
import { rasterPen } from '../../../../../../src/render/save-cam/trails/sheet.js';
import { createRaster } from '../../../../../../src/render/venues/kit/raster.js';
import { UNITS, VIEW } from '../../world.js';
import { baked, canBake } from '../bake.js';

// The Naga is thousands of pixels that change every frame, and some of its light is worked out
// pixel by pixel round what is drawn, so it is drawn on a sheet of the art grid the size of the
// widest view in plain JavaScript and laid on the canvas in one call. The margin takes a shake.
const MARGIN = 8;

const WIDTH = Math.ceil(VIEW.width / UNITS.least) + MARGIN * 2;

const HEIGHT = Math.ceil(VIEW.height / UNITS.least) + MARGIN * 2;

let raster = null;

let image = null;

function rasterFor(context) {
  if (!raster) {
    image = context?.createImageData?.(WIDTH, HEIGHT) ?? null;
    raster = image
      ? {
          width: WIDTH,
          height: HEIGHT,
          data: image.data,
          pixels: new Uint32Array(image.data.buffer),
        }
      : createRaster(WIDTH, HEIGHT);
  }

  raster.pixels.fill(0);

  return raster;
}

// a pen on the sheet whose art pixel (0, 0) is the world's, `left` and `top` the world pixel at
// the sheet's corner, so a dither laid on it stays put on the world as the camera moves
export function openSheet(pen) {
  const left = Math.floor(-pen.origin.x / pen.unit) - MARGIN;
  const top = Math.floor(-pen.origin.y / pen.unit) - MARGIN;
  const sheet = rasterPen(rasterFor(pen.context), { x: -left, y: -top });

  return Object.assign(sheet, { left, top });
}

const sheetCanvas = () =>
  baked(`naga-shot/projectile/sheet/${WIDTH}x${HEIGHT}`, {
    width: WIDTH,
    height: HEIGHT,
    paint: () => {},
  });

export function layDown(pen, sheet) {
  const { box, left, top } = sheet;
  const [width, height] = [box.right - box.left, box.bottom - box.top];
  const at = (value, base) => base + value * pen.unit;

  if (width <= 0 || height <= 0) {
    return;
  }

  if (!canBake() || !image) {
    drawRasterRuns(pen.context, sheet.raster, {
      x: at(left, pen.origin.x),
      y: at(top, pen.origin.y),
      scale: pen.unit,
    });

    return;
  }

  const canvas = sheetCanvas();

  canvas.getContext('2d').putImageData(image, 0, 0);
  pen.context.imageSmoothingEnabled = false;
  pen.context.drawImage(
    canvas,
    ...[box.left, box.top, width, height],
    ...[at(left + box.left, pen.origin.x), at(top + box.top, pen.origin.y)],
    ...[width * pen.unit, height * pen.unit],
  );
}
