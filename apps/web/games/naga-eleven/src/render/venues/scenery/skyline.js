import { hash2 } from '../kit/hash.js';
import { rect } from '../kit/raster.js';

// a city far off: blocks of every height side by side, their windows in rows, some lit, water
// tanks and masts on their roofs, lit on their left faces
function paintBlock(raster, { x, base, width, height, seed }, { ramp, window: glass }) {
  const top = base - height;

  rect(raster, { x, y: top, width, height }, ramp[1]);
  rect(raster, { x, y: top, width: 2, height }, ramp[2]);
  rect(raster, { x: x + width - 2, y: top, width: 2, height }, ramp[0]);
  rect(raster, { x, y: top, width, height: 1 }, ramp[2]);

  for (let y = top + 4; y < base - 3; y += 5) {
    for (let column = x + 4; column < x + width - 3; column += 4) {
      const lit = hash2(column, y, seed) < 0.12;

      rect(raster, { x: column, y, width: 2, height: 2 }, lit ? glass[1] : glass[0]);
    }
  }

  if (hash2(x, 1, seed) < 0.5) {
    rect(raster, { x: x + Math.round(width * 0.6), y: top - 5, width: 5, height: 5 }, ramp[0]);
  } else {
    rect(raster, { x: x + Math.round(width * 0.3), y: top - 9, width: 1, height: 9 }, ramp[0]);
  }
}

export function paintCity(raster, { salt, art }) {
  const base = raster.height;

  for (let x = -10; x < raster.width; x += 0) {
    const seed = hash2(x, salt, 3);
    const width = 18 + Math.round(seed * 34);
    const height = 50 + Math.round(hash2(x, salt, 4) ** 1.5 * (raster.height - 56));

    paintBlock(
      raster,
      { x, base, width, height, seed: salt },
      { ramp: art.city[Math.floor(seed * art.city.length)], window: art.window },
    );
    x += width + Math.round(hash2(x, salt, 5) * 4) - 1;
  }
}
