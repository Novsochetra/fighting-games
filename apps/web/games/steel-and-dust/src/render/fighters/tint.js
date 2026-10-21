const MAX_TINTED_FRAMES = 64;

export function createTintCache(createCanvas) {
  return { createCanvas, frames: new Map() };
}

function paintTint(canvas, { image, sx, sy, width, height, color }) {
  const context = canvas.getContext('2d');
  context.globalCompositeOperation = 'source-over';
  context.clearRect(0, 0, width, height);
  context.drawImage(image, sx, sy, width, height, 0, 0, width, height);
  context.globalCompositeOperation = 'source-in';
  context.fillStyle = color;
  context.fillRect(0, 0, width, height);
  context.globalCompositeOperation = 'source-over';
}

// a carved copy of one frame: the stone's color over the frame's own light and shade, so the carving
// keeps every line of the figure it was cut from
function paintRelief(canvas, { image, sx, sy, width, height, color }) {
  const context = canvas.getContext('2d');
  context.globalCompositeOperation = 'source-over';
  context.clearRect(0, 0, width, height);
  context.drawImage(image, sx, sy, width, height, 0, 0, width, height);
  context.globalCompositeOperation = 'color';
  context.fillStyle = color;
  context.fillRect(0, 0, width, height);
  context.globalCompositeOperation = 'destination-in';
  context.drawImage(image, sx, sy, width, height, 0, 0, width, height);
  context.globalCompositeOperation = 'source-over';
}

// the least recently used copy makes room, and lends its canvas when it is the right size
function makeRoom(cache, { width, height }) {
  if (cache.frames.size < MAX_TINTED_FRAMES) {
    return cache.createCanvas(width, height);
  }
  const [oldest, canvas] = cache.frames.entries().next().value;
  cache.frames.delete(oldest);
  const fits = canvas.width === width && canvas.height === height;
  return fits ? canvas : cache.createCanvas(width, height);
}

// a solid-color copy of one frame, for flashes, glows and afterimages, or a carved one. Tinting whole
// sheets kept a full-size copy of every sheet in every color for the whole session: tens of megabytes
// on a phone
export function tintedFrame(cache, frame) {
  const id = `${frame.key}|${frame.sx}|${frame.sy}|${frame.color}|${frame.relief ? 'relief' : ''}`;
  let canvas = cache.frames.get(id);
  if (canvas) {
    cache.frames.delete(id);
  } else {
    canvas = makeRoom(cache, frame);
    (frame.relief ? paintRelief : paintTint)(canvas, frame);
  }
  cache.frames.set(id, canvas);
  return canvas;
}

// where to read a frame from: the sheet itself, or its tinted copy
export function frameSource(cache, frame) {
  if (!frame.color) {
    return { image: frame.image, sx: frame.sx, sy: frame.sy };
  }
  return { image: tintedFrame(cache, frame), sx: 0, sy: 0 };
}
