import { mixes } from '../dither.js';
import { hash } from '../hash.js';
import { copyPixel, plot } from '../raster.js';

// Still water giving back everything above `line`: each row mirrors the row as far above, pulled
// a pixel or two sideways by the ripples (more the nearer the water comes) and darkened toward
// `colors` [deep, ripple] with distance from the bank
export function paintReflection(raster, { line, bottom = raster.height, colors, seed = 1 }) {
  for (let y = line + 1; y < bottom; y += 1) {
    const depth = (y - line) / (bottom - line);
    const source = line - (y - line);
    const sway = Math.round(Math.sin(y * 0.9 + hash(seed, y) * 6) * (0.5 + depth * 2.2));

    for (let x = 0; x < raster.width; x += 1) {
      copyPixel(
        raster,
        { x: Math.min(raster.width - 1, Math.max(0, x + sway)), y: Math.max(0, source) },
        { x, y },
      );

      if (y % 2 === 0 && mixes(x, y, 0.2 + depth * 0.5)) {
        plot(raster, x, y, colors[0]);
      } else if (hash(seed, x >> 2, y) > 0.95) {
        plot(raster, x, y, colors[1]);
      }
    }
  }
}

// the sun's road across the water: broken bright dashes under it, wider toward us; `colors`
// [white, gold, orange]
export function glitterDashes({ x, line, bottom, tick = 0, seed = 1 }) {
  const dashes = [];

  for (let y = line + 2; y < bottom; y += 2) {
    const depth = (y - line) / (bottom - line);
    const spread = 4 + depth * 30;
    const count = 1 + Math.floor(depth * 4);

    for (let i = 0; i < count; i += 1) {
      const turn = Math.floor(tick / 10);
      const dashX = x + (hash(seed, y, i, turn) - 0.5) * spread * 2;

      dashes.push({
        x: Math.round(dashX),
        y,
        width: 1 + Math.floor(hash(seed, y, i) * (2 + depth * 5)),
        tone: Math.min(2, Math.floor(depth * 3 * hash(seed, i, y))),
      });
    }
  }

  return dashes;
}
