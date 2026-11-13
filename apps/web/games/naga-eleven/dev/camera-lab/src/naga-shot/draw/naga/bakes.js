import { baked } from '../bake.js';
import { rasterOf } from './raster.js';

export const bakeKey = (...parts) => `naga-shot/rising/${parts.join('/')}`;

function putPixels(context, { width, height }, pixels) {
  const image = context.createImageData(width, height);

  new Uint32Array(image.data.buffer).set(pixels);
  context.putImageData(image, 0, 0);
}

export const bakedLook = (key, raster, look = (same) => same.pixels) =>
  baked(key, {
    width: raster.width,
    height: raster.height,
    paint: (pen) => putPixels(pen.context, raster, look(raster)),
  });

export const figureLayout = (look) => rasterOf('figure', look);

export const colourBake = (look) =>
  bakedLook(bakeKey('colour', look.size, look.gape), rasterOf('figure', look));

export const headBake = (look) =>
  bakedLook(bakeKey('head', look.size, look.gape), rasterOf('head', look));
