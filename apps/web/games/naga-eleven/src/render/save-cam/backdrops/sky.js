import { INNER } from '../../duel/layout.js';
import { bayer, hash2 } from '../../venues/kit/hash.js';
import { CLEAR } from '../../venues/kit/colour.js';
import { rect } from '../../venues/kit/raster.js';
import { toneOf } from './tone.js';

// the venue's sky ramp from the top of the view down to `to`, in bands dithered only where one
// meets the next; nothing above the film's bars, where the match shows through as they slide away
export function paintSkyRamp(raster, { ramp, to }) {
  for (let y = INNER.top; y < raster.height; y += 1) {
    const tone = Math.min(1, (y - INNER.top) / (to - INNER.top)) * ramp.length - 0.5;

    for (let x = 0; x < raster.width; x += 1) {
      raster.pixels[y * raster.width + x] = toneOf(ramp, tone, x, y);
    }
  }

  rect(raster, { x: 0, y: 0, width: raster.width, height: INNER.top }, CLEAR);
}

// the cloud's top edge over a column: the highest of its round lumps there
function topOf(lumps, x) {
  let top = Infinity;

  for (const lump of lumps) {
    const dx = x - lump.x;

    if (Math.abs(dx) < lump.radius) {
      top = Math.min(top, lump.y - Math.sqrt(lump.radius ** 2 - dx * dx));
    }
  }

  return top;
}

function lumpsOf({ x, width, base, salt }) {
  const count = Math.max(2, Math.round(width / 9));

  return Array.from({ length: count }, (_, i) => {
    const middle = 1 - Math.abs((i + 0.5) / count - 0.5) * 2;
    const radius = 3 + middle * width * 0.14 + hash2(i, salt, 41) * 2.5;

    return { x: x + ((i + 0.5) * width) / count, y: base - radius * 0.35, radius };
  });
}

// a heap of white lumps on a flat grey belly, lit from the top left, the sun's side
function cloudColumn(raster, { column, top, cloud, ramp }) {
  const lit = column < cloud.x + cloud.width * 0.45;

  for (let y = Math.ceil(top); y <= cloud.base; y += 1) {
    const down = (y - top) / Math.max(1, cloud.base - top);
    const belly = cloud.base - y < 2 || down + (bayer(column, y) - 0.5) * 0.12 > 0.72;
    const rim = y - top < 1.5 && lit;
    let shade = belly ? 1 : 2;

    shade = rim ? 3 : shade;
    shade = cloud.base - y < 1 && !lit ? 0 : shade;
    raster.pixels[y * raster.width + column] = ramp[shade];
  }
}

export function paintCloud(raster, cloud, ramp) {
  const lumps = lumpsOf(cloud);
  const from = Math.floor(cloud.x - 6);
  const to = Math.ceil(cloud.x + cloud.width + 6);

  for (let column = Math.max(0, from); column < Math.min(raster.width, to); column += 1) {
    const top = Math.max(INNER.top, topOf(lumps, column + 0.5));

    if (Number.isFinite(top) && top < cloud.base) {
      cloudColumn(raster, { column, top, cloud, ramp });
    }
  }
}
