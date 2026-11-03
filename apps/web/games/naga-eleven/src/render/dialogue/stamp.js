const MOST_KEPT = 12;

const browserFactory = () =>
  typeof globalThis.OffscreenCanvas === 'function'
    ? (width, height) => new globalThis.OffscreenCanvas(width, height)
    : null;

const store = { factory: browserFactory(), stamps: new Map() };

// a test hands in a canvas of its own; with none (Node), each frame is drawn straight on
export function setDialogueCanvasFactory(factory) {
  store.factory = factory ?? null;
  store.stamps.clear();
}

function stampOf(key, { width, height }, paint) {
  const found = store.stamps.get(key);

  if (found) {
    return found;
  }

  const stamp = store.factory(width, height);
  const context = stamp.getContext('2d');

  context.imageSmoothingEnabled = false;
  paint(context);
  store.stamps.set(key, stamp);

  if (store.stamps.size > MOST_KEPT) {
    store.stamps.delete(store.stamps.keys().next().value);
  }

  return stamp;
}

// a frame of a few hundred rects that never changes is drawn once, then laid down whole each tick
export function drawStamped(context, key, { x, y, width, height }, paint) {
  if (!store.factory) {
    context.save();
    context.translate(x, y);
    paint(context);
    context.restore();

    return;
  }

  context.drawImage(stampOf(key, { width, height }, paint), x, y);
}
