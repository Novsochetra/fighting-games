import { mixes } from '../dither.js';
import { hash, smoothNoise } from '../hash.js';
import { plot } from '../raster.js';

function streakColor(colors, { fromLit, height, x, y }) {
  if (fromLit === 0) {
    return colors[2];
  }

  if (fromLit === 1) {
    return mixes(x, y, 0.5) ? colors[2] : colors[1];
  }

  return colors[fromLit < height * 0.6 ? 1 : 0];
}

// a long thin cloud of dawn or dusk, lumpy on its sunward side; `colors` run [shade, body, lit],
// and the lit edge faces a sun below the cloud when `litBelow`, above it otherwise
export function paintStreak(raster, { x, y, width, thickness, colors, seed = 1, litBelow = true }) {
  for (let column = 0; column < width; column += 1) {
    const envelope = Math.sin(Math.PI * (column / width)) ** 0.6;
    const above = thickness * envelope * (0.45 + 0.7 * smoothNoise(seed, column, 7));
    const below = thickness * envelope * (0.15 + 0.35 * smoothNoise(seed + 9, column, 11));
    const top = Math.round(y - above);
    const height = Math.max(1, Math.round(y + below) - top);

    for (let row = 0; row < height; row += 1) {
      const fromLit = litBelow ? height - 1 - row : row;

      plot(
        raster,
        x + column,
        top + row,
        streakColor(colors, { fromLit, height, x: x + column, y: top + row }),
      );
    }
  }
}

function puffTop(puffs, column) {
  let top = Infinity;

  for (const puff of puffs) {
    const dx = column - puff.x;

    if (Math.abs(dx) < puff.radius) {
      top = Math.min(top, puff.y - Math.sqrt(puff.radius * puff.radius - dx * dx));
    }
  }

  return top;
}

function puffsOf({ x, y, width, height, seed }) {
  const count = Math.max(2, Math.round(width / (height * 0.9)));

  return Array.from({ length: count }, (_, i) => {
    const along = (i + 0.5) / count;
    const swell = Math.sin(Math.PI * along) * 0.6 + 0.4;

    return {
      x: x + along * width,
      y,
      radius: height * swell * (0.75 + 0.35 * hash(seed, i)),
    };
  });
}

// a fair-weather cloud: round puffs over a flat base, lit from the top left; `colors` run
// [shade, body, lit, glint]
export function paintCumulus(raster, { x, y, width, height, colors, seed = 1 }) {
  const puffs = puffsOf({ x, y, width, height, seed });

  for (let column = Math.floor(x - height); column < x + width + height; column += 1) {
    const top = Math.round(puffTop(puffs, column));

    for (let row = top; row <= y; row += 1) {
      const depth = row - top;
      const fromBase = y - row;
      const shaded = fromBase < 2 || (fromBase < 5 && mixes(column, row, 0.5));
      const lit = depth < 2 && column < x + width * 0.7;

      plot(raster, column, row, lit ? colors[depth === 0 ? 3 : 2] : colors[shaded ? 0 : 1]);
    }
  }
}
