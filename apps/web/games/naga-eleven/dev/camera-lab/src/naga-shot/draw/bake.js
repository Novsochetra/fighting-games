import { createPen } from '../../../../../src/render/duel/pen.js';

// what a layer drawn once and stamped many times is drawn on: the lab gives the page's canvases,
// a test gives its own; with none, a layer that needs one draws without it
let makeCanvas = null;

const kept = new Map();

const MOST_KEPT = 240;

export function setBakeCanvas(factory) {
  makeCanvas = factory;
  kept.clear();
}

export const canBake = () => makeCanvas !== null;

function keep(key, canvas) {
  if (kept.size >= MOST_KEPT) {
    kept.delete(kept.keys().next().value);
  }

  kept.set(key, canvas);

  return canvas;
}

// `paint(pen)` drawn once on a canvas of art pixels, one canvas pixel each, kept under `key`
export function baked(key, { width, height, paint }) {
  if (!makeCanvas) {
    return null;
  }

  if (!kept.has(key)) {
    const canvas = makeCanvas(Math.max(1, Math.ceil(width)), Math.max(1, Math.ceil(height)));
    const context = canvas.getContext('2d');

    context.imageSmoothingEnabled = false;
    paint(createPen(context, { unit: 1 }));
    keep(key, canvas);
  }

  return kept.get(key);
}

// a baked canvas changed pixel by pixel: `change(rgba, x, y)` gives the pixel's new [r, g, b, a],
// or null to leave it; kept under its own key
export function rebaked(key, source, change) {
  if (!makeCanvas || !source) {
    return null;
  }

  if (!kept.has(key)) {
    const canvas = makeCanvas(source.width, source.height);
    const context = canvas.getContext('2d');
    const image = source.getContext('2d').getImageData(0, 0, source.width, source.height);

    changePixels(image, change);
    context.putImageData(image, 0, 0);
    keep(key, canvas);
  }

  return kept.get(key);
}

function changePixels(image, change) {
  const { data, width } = image;

  for (let at = 0; at < data.length; at += 4) {
    const next = change(data.subarray(at, at + 4), (at / 4) % width, Math.floor(at / 4 / width));

    if (next) {
      data.set(next, at);
    }
  }
}

// a baked canvas laid on the pen with its top left at an art point, each of its pixels one art
// pixel, so it lines up with everything the pen draws; `flip` mirrors it about its middle
export function stamp(pen, canvas, { left, top, flip = false, alpha = 1 }) {
  if (!canvas || alpha <= 0) {
    return;
  }

  const { context, unit, origin } = pen;
  const x = origin.x + Math.round(left) * unit;
  const y = origin.y + Math.round(top) * unit;

  context.save();
  context.imageSmoothingEnabled = false;
  context.globalAlpha *= alpha;
  context.translate(flip ? x + canvas.width * unit : x, y);
  context.scale(flip ? -unit : unit, unit);
  context.drawImage(canvas, 0, 0);
  context.restore();
}

// a colour of the palette as the [r, g, b] a pixel holds
export const rgbOf = (color) => [1, 3, 5].map((at) => parseInt(color.slice(at, at + 2), 16));
