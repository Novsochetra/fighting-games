import { hash2 } from '../kit/hash.js';
import { rect, tint } from '../kit/raster.js';
import { paintSky } from './sky.js';

// a night sky, a few stars pricking through, and low down the glow the stadium throws up
export function paintNightSky(raster, { sky, star, glow }) {
  paintSky(raster, { ramp: sky });

  for (let i = 0; i < raster.width / 6; i += 1) {
    const x = Math.floor(hash2(i, 1, 51) * raster.width);
    const y = Math.floor(hash2(i, 2, 51) * raster.height * 0.7);

    rect(raster, { x, y, width: 1, height: 1 }, hash2(i, 3, 51) < 0.2 ? star[1] : star[0]);
  }

  for (let y = Math.floor(raster.height * 0.5); y < raster.height; y += 1) {
    const share = ((y / raster.height - 0.5) / 0.5) * 0.35;

    for (let x = 0; x < raster.width; x += 1) {
      tint(raster, x, y, { colour: glow, share });
    }
  }
}

// a beam of light down from a lamp: a thin wedge of glow that fades as it falls
export function paintBeam(raster, { x, top, length, lean }, glow) {
  for (let step = 0; step < length; step += 1) {
    const half = 1 + Math.floor(step / 6);
    const share = 0.16 * (1 - step / length);

    for (let dx = -half; dx <= half; dx += 1) {
      tint(raster, Math.round(x + lean * step) + dx, top + step, { colour: glow, share });
    }
  }
}
