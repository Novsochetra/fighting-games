import { hashInt } from '../../../lib/math.js';
import { emitterSpots } from './emitters.js';
import { isOnScreen, wrapX } from './motion.js';

const SALT = 15000;
const LIFE = 180;

function puffAt(spot, { puff, puffs, tick }) {
  const age = wrapX(tick + Math.floor((puff * LIFE) / puffs) + spot.index * 37, LIFE);
  const progress = age / LIFE;
  const size = 2 + Math.round(progress * 4);
  return {
    x: spot.x + progress * 20 + Math.sin(age * 0.05 + puff) * 1.5 - size / 2,
    y: spot.y - 6 - age * 0.3 - size / 2,
    size,
    alpha: 0.32 * Math.min(1, progress * 6) * (1 - progress),
  };
}

function drawPuffs(painter, spot, tick) {
  const puffs = 4 + (hashInt(spot.index + SALT) % 3);
  for (let puff = 0; puff < puffs; puff++) {
    const { x, y, size, alpha } = puffAt(spot, { puff, puffs, tick });
    if (alpha > 0 && isOnScreen(x, y, size)) {
      painter.alpha(alpha).rect(x, y, size, size);
    }
  }
}

export function drawSmoke(painter, { effect, tick, cameraX, colors }) {
  painter.use(colors.smoke);
  for (const spot of emitterSpots(effect, cameraX)) {
    drawPuffs(painter, spot, tick);
  }
  painter.alpha(1);
}
