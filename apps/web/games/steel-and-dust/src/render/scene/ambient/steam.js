import { emitterSpots } from './emitters.js';
import { isOnScreen, wrapX } from './motion.js';

const PUFF_EVERY = 3;
const LIFE = 50;
const REACH = 26;

// a vent blows for its first `burst` ticks of every period, a puff every few ticks; each puff
// shoots out fast, slows, swells and lifts as it thins
function puffAt(spot, { puff, tick, effect }) {
  const age = wrapX(tick + spot.index * 71, effect.period) - puff * PUFF_EVERY;
  if (age < 0 || age >= LIFE) {
    return null;
  }
  const progress = age / LIFE;
  const reach = REACH * (1 - (1 - progress) ** 2);
  const size = 3 + Math.round(progress * 9);
  const [towardX, towardY] = effect.toward;
  return {
    x: Math.round(spot.x + towardX * reach - size / 2 + Math.sin(age * 0.3 + puff) * progress),
    y: Math.round(spot.y + towardY * reach - age * 0.16 - size / 2),
    size,
    alpha: 0.7 * (1 - progress),
  };
}

function drawPuff(painter, { x, y, size, alpha }) {
  const inset = size >> 2;
  painter.alpha(alpha);
  painter.rect(x + inset, y, size - inset * 2, size);
  painter.rect(x, y + inset, size, size - inset * 2);
}

// bursts of steam hissing out of the pipes and valves of the near layer, then quiet
export function drawSteam(painter, { effect, tick, cameraX, colors }) {
  const puffs = Math.ceil(effect.burst / PUFF_EVERY);
  painter.use(colors.steam);
  for (const spot of emitterSpots(effect, cameraX)) {
    for (let puff = 0; puff < puffs; puff++) {
      const cloud = puffAt(spot, { puff, tick, effect });
      if (cloud && isOnScreen(cloud.x, cloud.y, cloud.size)) {
        drawPuff(painter, cloud);
      }
    }
  }
  painter.alpha(1);
}
