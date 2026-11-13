import { GROUND } from '../../world.js';
import { ditherAt } from './layers.js';
import { TURF_TONES } from './palette.js';

export const POOL_TONE = TURF_TONES.line + 1;

const SPARK_TONE = POOL_TONE + 5;

const FLAT = 0.2;

// behind his feet, where the Naga rises
const MIDDLE = GROUND - 6;

// on grass in full light the ramp's deep end would read as a puddle, not light
const FLOOR_BY_DUSK = [2, 2, 1, 0, 0];

function litTone(tone, { band, sparkle, floor }) {
  if (tone === TURF_TONES.fleck && band >= 2) {
    return SPARK_TONE + sparkle;
  }

  const lift = tone >= TURF_TONES.lineShade ? 2 : Math.max(-1, tone - TURF_TONES.mid);

  return POOL_TONE + Math.max(floor, Math.min(4, band - 1 + lift + floor));
}

function bandAt({ x, y, pool }) {
  const across = (x - pool.x) / pool.radius;
  const down = (y - MIDDLE) / (pool.radius * FLAT);
  const reach = Math.sqrt(across * across + down * down);

  if (reach >= 1) {
    return 0;
  }

  const strength = (1 - reach * reach) * (pool.level + 0.6) + (ditherAt(x, y) - 0.5) * 0.9;

  return Math.max(0, Math.min(4, Math.floor(strength)));
}

export function lightPool(tones, { view, pool, frame, dusk }) {
  if (!pool.level) {
    return;
  }

  const top = Math.max(view.top, Math.floor(MIDDLE - pool.radius * FLAT));
  const bottom = Math.min(view.top + view.height, Math.ceil(MIDDLE + pool.radius * FLAT) + 1);
  const left = Math.max(view.from, Math.floor(pool.x - pool.radius));
  const right = Math.min(view.from + view.width, Math.ceil(pool.x + pool.radius) + 1);

  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) {
      const band = bandAt({ x, y, pool });
      const at = (y - view.top) * view.stride + (x - view.from);

      if (band > 0) {
        const sparkle = (x + y + (frame >> 3)) & 1;

        tones[at] = litTone(tones[at], { band, sparkle, floor: FLOOR_BY_DUSK[dusk] });
      }
    }
  }
}
