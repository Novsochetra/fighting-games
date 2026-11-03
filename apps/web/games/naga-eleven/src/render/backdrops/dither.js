import { plot } from './raster.js';

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

export const threshold = (x, y) => (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;

// true where a pixel takes the second of two colours mixed at `level` (0 none of it, 1 all)
export const mixes = (x, y, level) => level > threshold(x, y);

const clamp01 = (value) => Math.min(1, Math.max(0, value));

// where a smooth position `at` between colours lands: flat across most of each band, dithered
// only over its last `edge` part, so a sky reads as a few clean bands
export function bandAt(along, count, edge) {
  const clamped = Math.min(Math.max(along, 0), count - 1);
  const band = Math.min(Math.floor(clamped), count - 2);
  const part = clamped - band;

  return { band, level: clamp01((part - (1 - edge)) / edge) };
}

export function pickColor(colors, { at, x, y, edge }) {
  const { band, level } = bandAt(at, colors.length, edge);

  return mixes(x, y, level) ? colors[band + 1] : colors[band];
}

// `colors` from the top row to the bottom one
export function gradient(
  raster,
  { top, bottom, colors, left = 0, right = raster.width, edge = 0.4 },
) {
  const span = Math.max(1, bottom - top - 1);

  for (let y = top; y < bottom; y += 1) {
    const along = ((y - top) / span) * (colors.length - 1);

    for (let x = left; x < right; x += 1) {
      plot(raster, x, y, pickColor(colors, { at: along, x, y, edge }));
    }
  }
}

function glowColor(colors, { distance, x, y }) {
  const along = (1 - distance) * colors.length;

  if (along < 1) {
    return mixes(x, y, along) ? colors[0] : null;
  }

  return pickColor(colors, { at: along - 1, x, y, edge: 0.5 });
}

// rings of light round a point, `colors` from the outer ring to the core; `squash` flattens it
export function glow(raster, { x, y, radius, colors, squash = 1 }) {
  for (let row = Math.floor(y - radius * squash); row <= y + radius * squash; row += 1) {
    for (let column = Math.floor(x - radius); column <= x + radius; column += 1) {
      const across = (column - x) / radius;
      const down = (row - y) / (radius * squash);
      const distance = Math.sqrt(across * across + down * down);

      if (distance < 1) {
        plot(raster, column, row, glowColor(colors, { distance, x: column, y: row }));
      }
    }
  }
}
