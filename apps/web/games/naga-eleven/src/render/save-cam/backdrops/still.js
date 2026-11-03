import { drawRasterRuns } from '../../backdrops/blit.js';
import { ART } from '../../duel/layout.js';
import { defaultCanvas, rasterToCanvas } from '../../venues/kit/canvas.js';
import { createRaster } from '../../venues/kit/raster.js';

// a venue's backdrop is painted once on a canvas of the art grid and laid down whole each frame;
// a match moves from venue to venue, so only the last few are kept
const KEEP = 4;
const store = { factory: defaultCanvas, stills: new Map() };

// a test hands in a canvas of its own, or null to have each still laid down as runs of one colour
export function setSaveCamCanvasFactory(factory) {
  store.factory = factory ?? (() => null);
  store.stills.clear();
}

function bake(paint) {
  const raster = createRaster(ART.width, ART.height);

  paint(raster);

  return { raster, canvas: rasterToCanvas(raster, store.factory) };
}

export function stillOf(key, paint) {
  if (!store.stills.has(key)) {
    while (store.stills.size >= KEEP) {
      store.stills.delete(store.stills.keys().next().value);
    }

    store.stills.set(key, bake(paint));
  }

  return store.stills.get(key);
}

// `paint(raster)` fills the art grid once; the same key must always paint the same picture
export function drawStill(pen, { key, paint }) {
  const { raster, canvas } = stillOf(key, paint);
  const { context, origin, unit } = pen;

  if (!canvas) {
    drawRasterRuns(context, raster, { x: origin.x, y: origin.y, scale: unit });

    return;
  }

  context.imageSmoothingEnabled = false;
  context.drawImage(canvas, origin.x, origin.y, ART.width * unit, ART.height * unit);
}
