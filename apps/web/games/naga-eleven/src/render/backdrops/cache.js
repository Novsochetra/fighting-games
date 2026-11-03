import { drawRasterRuns, rasterToCanvas } from './blit.js';
import { ART_SCALE } from './raster.js';

// a few scenes and their frames are kept: a story moves between two or three places at a time
const MOST_KEPT = 12;

const browserFactory = () =>
  typeof globalThis.OffscreenCanvas === 'function'
    ? (width, height) => new globalThis.OffscreenCanvas(width, height)
    : null;

const store = { factory: browserFactory(), canvases: new Map(), rasters: new Map() };

// a test hands in a canvas of its own, or null to have every layer painted and drawn straight
export function setBackdropCanvasFactory(factory) {
  store.factory = factory ?? null;
  store.canvases.clear();
  store.rasters.clear();
}

function remember(map, key, make) {
  const found = map.get(key);

  if (found) {
    map.delete(key);
    map.set(key, found);

    return found;
  }

  const made = make();

  map.set(key, made);

  if (map.size > MOST_KEPT) {
    map.delete(map.keys().next().value);
  }

  return made;
}

// `paint` makes the layer's buffer; the same `key` must always paint the same picture
export function drawLayer(context, { key, paint, x = 0, y = 0, scale = ART_SCALE }) {
  if (!store.factory) {
    drawRasterRuns(context, remember(store.rasters, key, paint), { x, y, scale });

    return;
  }

  const canvas = remember(store.canvases, key, () => rasterToCanvas(paint(), store.factory));

  context.drawImage(canvas, x, y, canvas.width * scale, canvas.height * scale);
}
