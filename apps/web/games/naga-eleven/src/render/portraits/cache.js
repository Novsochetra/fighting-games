import { createLru } from './lru.js';

const browserFactory = () =>
  typeof globalThis.OffscreenCanvas === 'function'
    ? (width, height) => new globalThis.OffscreenCanvas(width, height)
    : null;

// a scene shows a few faces at a time, so the most recently drawn 48 are plenty to keep
const store = { factory: browserFactory(), canvases: createLru(48) };

export function setPortraitCanvasFactory(factory) {
  store.factory = factory ?? null;
  store.canvases.clear();
}

export function clearPortraitCache() {
  store.canvases.clear();
}

export function cachedCanvas(key, size, paint) {
  if (!store.factory) {
    return null;
  }

  const found = store.canvases.get(key);

  if (found) {
    return found;
  }

  const canvas = store.factory(size, size);
  const context = canvas.getContext('2d');

  context.imageSmoothingEnabled = false;
  paint(context);
  store.canvases.set(key, canvas);

  return canvas;
}
