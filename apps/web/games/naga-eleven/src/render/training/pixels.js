import { VIEW } from '../../config.js';

// the drills are painted on a grid of 2x2 canvas pixels, the size the HUD's 16 px type is built on
export const ART = 2;
export const ART_VIEW = { width: VIEW.width / ART, height: VIEW.height / ART };

export function inArt(context, draw) {
  context.save();
  context.imageSmoothingEnabled = false;
  context.scale(ART, ART);
  draw();
  context.restore();
}

export function paint(context, color, [x, y, width, height]) {
  context.fillStyle = color;
  context.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

export function faded(context, alpha, draw) {
  const before = context.globalAlpha;

  context.globalAlpha = before * Math.max(0, Math.min(1, alpha));
  draw();
  context.globalAlpha = before;
}

// circles are filled a row at a time so their edges stay on whole pixels, never smoothed
const halfWidth = (radius, row) => {
  const reach = (radius + 0.5) * (radius + 0.5) - row * row;

  return reach < 0 ? -1 : Math.floor(Math.sqrt(reach));
};

export function oval(context, color, { x, y, radiusX, radiusY = radiusX }) {
  const left = Math.round(x);
  const top = Math.round(y);
  const rows = Math.round(radiusY);

  context.fillStyle = color;

  for (let row = -rows; row <= rows; row += 1) {
    const across = rows > 0 ? Math.round((halfWidth(rows, row) * radiusX) / rows) : radiusX;

    if (across >= 0) {
      context.fillRect(left - across, top + row, across * 2 + 1, 1);
    }
  }
}

export function ring(context, color, { x, y, radius, width = 1 }) {
  const left = Math.round(x);
  const top = Math.round(y);
  const outer = Math.round(radius);
  const inner = outer - width;

  context.fillStyle = color;

  for (let row = -outer; row <= outer; row += 1) {
    const out = halfWidth(outer, row);
    const hole = inner >= 0 ? halfWidth(inner, row) : -1;
    const span = out - hole;

    if (out >= 0 && span > 0) {
      context.fillRect(left - out, top + row, span, 1);
      context.fillRect(left + hole + 1, top + row, span, 1);
    }
  }
}

// a straight line one pixel thick, stepped along its longer side
export function line(context, color, [from, to]) {
  const steps = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y), 1);

  context.fillStyle = color;

  for (let i = 0; i <= steps; i += 1) {
    const x = from.x + ((to.x - from.x) * i) / steps;
    const y = from.y + ((to.y - from.y) * i) / steps;

    context.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
}

// a checker of every other pixel, to blend two flat bands
export function dither(context, color, [x, y, width, height], phase = 0) {
  context.fillStyle = color;

  for (let row = 0; row < height; row += 1) {
    for (let column = (row + phase) % 2; column < width; column += 2) {
      context.fillRect(Math.round(x) + column, Math.round(y) + row, 1, 1);
    }
  }
}

// a fixed scatter from a whole number, so the same scene draws the same every frame
export function noise(seed) {
  let mixed = Math.imul((seed | 0) ^ 0x9e3779b9, 0x85ebca6b);

  mixed = Math.imul(mixed ^ (mixed >>> 13), 0xc2b2ae35);

  return ((mixed ^ (mixed >>> 16)) >>> 0) / 4294967296;
}

// a triangle wave from 0 to 1 and back over a period, for bobbing and pulsing
export function pulse(tick, period) {
  const phase = (((tick % period) + period) % period) / period;

  return phase < 0.5 ? phase * 2 : 2 - phase * 2;
}
