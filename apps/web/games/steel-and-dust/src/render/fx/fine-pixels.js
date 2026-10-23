import { RENDER_SCALE } from '../../config.js';
import { hashInt } from '../../lib/math.js';
import { createRunFill } from './run-fill.js';

// the world is drawn at RENDER_SCALE, so one screen pixel is this share of a world pixel: effects
// drawn in code step by it to sit on the sprites' own pixel grid
export const PIXEL = 1 / RENDER_SCALE;

export const snap = (value) => Math.round(value / PIXEL) * PIXEL;

// a steady 0..1 value for a part's index and a beat of the clock: drawing never calls Math.random,
// whose order the replays record
export const flicker = (seed, beat) => hashInt(hashInt(seed) + beat) / 4294967296;

// one of a few fixed levels, picked by a steady flicker, so a glow steps rather than fades
export const steppedLevel = (levels, seed, beat) =>
  levels[Math.min(levels.length - 1, Math.floor(flicker(seed, beat) * levels.length))];

// the rows of a pixel ellipse, one screen pixel apart out from its middle row, each with the half
// width it spans; the extra half pixel on the height keeps the top and bottom rows from vanishing
export function ellipseRows(rx, ry) {
  const rows = Math.max(0, Math.round(ry / PIXEL));
  return Array.from({ length: rows * 2 + 1 }, (_, i) => {
    const dy = (i - rows) * PIXEL;
    const share = 1 - (dy / (ry + PIXEL / 2)) ** 2;
    return { dy, half: snap(Math.max(0, rx) * Math.sqrt(Math.max(0, share))) };
  });
}

// the same rows with the hole of a ring `width` screen pixels thick cut out of their middles
export function ringRows(rx, ry, width = 1) {
  const inset = width * PIXEL;
  const inner = ellipseRows(rx - inset, ry - inset);
  return ellipseRows(rx, ry).map((row, i) => {
    const hole = inner[i - width]?.half ?? 0;
    return { ...row, hole: Math.max(0, Math.min(hole, row.half - inset)) };
  });
}

// fills rows from ellipseRows or ringRows round (x, y) in the context's color
export function fillRows(context, { x, y, rows }) {
  const left = snap(x);
  const top = snap(y);
  for (const { dy, half, hole = 0 } of rows) {
    if (half <= 0) {
      continue;
    }
    if (hole <= 0) {
      context.fillRect(left - half, top + dy, half * 2, PIXEL);
      continue;
    }
    context.fillRect(left - half, top + dy, half - hole, PIXEL);
    context.fillRect(left + hole, top + dy, half - hole, PIXEL);
  }
}

export function fineRect(context, { x, y, width, height }) {
  const left = snap(x);
  const top = snap(y);
  context.fillRect(
    left,
    top,
    Math.max(PIXEL, snap(x + width) - left),
    Math.max(PIXEL, snap(y + height) - top),
  );
}

// a line stepped one screen pixel at a time along its longer axis, `width` screen pixels thick
export function fineLine(context, { from, to, width = 1 }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const steps = Math.max(1, Math.round(Math.max(Math.abs(dx), Math.abs(dy)) / PIXEL));
  const size = width * PIXEL;
  const offset = ((width - 1) / 2) * PIXEL;
  const fills = createRunFill(context);
  for (let i = 0; i <= steps; i++) {
    const x = snap(from.x + (dx * i) / steps) - offset;
    const y = snap(from.y + (dy * i) / steps) - offset;
    fills.add(snap(x), snap(y), size, size);
  }
  fills.flush();
}

// draws with light added to what lies under it, then goes back to painting over
export function inLight(context, draw) {
  context.globalCompositeOperation = 'lighter';
  draw();
  context.globalCompositeOperation = 'source-over';
}
