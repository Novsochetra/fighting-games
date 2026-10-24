// enough for every string and frame on screen at once; past it the least recently drawn canvas is
// reused, so a counting score never grows the cache
const MAX_STAMPS = 128;

export function createStamps(createCanvas) {
  return { createCanvas, cache: new Map() };
}

function recycledCanvas(stamps) {
  if (stamps.cache.size < MAX_STAMPS) {
    return stamps.createCanvas(1, 1);
  }
  const [oldestKey, canvas] = stamps.cache.entries().next().value;
  stamps.cache.delete(oldestKey);
  return canvas;
}

function stampFor(stamps, { key, width, height, resolution, draw }) {
  const cached = stamps.cache.get(key);
  if (cached) {
    stamps.cache.delete(key);
    stamps.cache.set(key, cached);
    return cached;
  }
  const canvas = recycledCanvas(stamps);
  // sizing a canvas clears it and resets its context
  canvas.width = width * resolution;
  canvas.height = height * resolution;
  const context = canvas.getContext('2d');
  context.imageSmoothingEnabled = false;
  context.setTransform(resolution, 0, 0, resolution, 0, 0);
  draw(context, 0, 0);
  stamps.cache.set(key, canvas);
  return canvas;
}

// a drawing that repeats frame after frame is made once on its own canvas and then laid down with
// one drawImage: on an iPhone each canvas call costs the GPU, and the HUD's pixel font alone took
// hundreds of fillRects a frame, enough to keep the phone hot; without stamps it is drawn as before
export function drawStamped(painter, { key, x, y, width, height, resolution = 1, draw }) {
  if (!painter.stamps) {
    draw(painter.context, x, y);
    return;
  }
  if (width <= 0 || height <= 0) {
    return;
  }
  const stamp = stampFor(painter.stamps, { key, width, height, resolution, draw });
  painter.context.drawImage(stamp, x, y, width, height);
}
