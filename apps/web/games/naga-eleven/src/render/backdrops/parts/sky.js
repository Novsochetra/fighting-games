import { glow, gradient } from '../dither.js';
import { hash } from '../hash.js';
import { plot } from '../raster.js';
import { disc } from '../shapes.js';

export function paintSky(raster, { colors, top = 0, bottom, edge = 0.45 }) {
  gradient(raster, { top, bottom, colors, edge });
}

// a few stars, the brightest with a cross of light, thinning toward the horizon
export function paintStars(
  raster,
  { count, bottom, colors, seed = 1, left = 0, width = raster.width, top = 0 },
) {
  for (let i = 0; i < count; i += 1) {
    const x = left + Math.floor(hash(seed, i, 1) * width);
    const y = top + Math.floor(hash(seed, i, 2) ** 1.6 * (bottom - top));
    const bright = hash(seed, i, 3) > 0.85;

    plot(raster, x, y, colors[bright ? 0 : 1 + (i % (colors.length - 1))]);

    if (bright) {
      [-1, 1].forEach((side) => {
        plot(raster, x + side, y, colors.at(-1));
        plot(raster, x, y + side, colors.at(-1));
      });
    }
  }
}

// `colors.glow` rings out from the sun's `colors.rim` and `colors.core`
export function paintSun(raster, { x, y, radius, colors, glowRadius, squash = 0.7 }) {
  glow(raster, { x, y, radius: glowRadius, colors: colors.glow, squash });
  disc(raster, { x, y, radius }, colors.rim);
  disc(raster, { x: x - 1, y: y - 1, radius: radius - 1.5 }, colors.core);
}

// the sun half risen: its disc cut flat by the horizon
