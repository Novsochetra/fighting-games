import { CYCLE_WIDTH, isOnScreen, scrollX, trait } from './motion.js';
import { stormStrength } from './storm.js';

const SALT = 19000;
const PUFFS = 4;
const MARGIN = 40;

// each plume lives its own cycle, rolling with the wind along the foot of the canyon while it
// swells and fades; every new life starts somewhere else
function plumeAt(i, { effect, tick, cameraX }) {
  const seed = i + SALT;
  const life = 220 + Math.floor(trait(seed, 1) * 160);
  const clock = tick + Math.floor(trait(seed, 2) * life);
  const round = Math.floor(clock / life);
  const age = clock - round * life;
  const startX = trait(seed * 131 + round, 3) * CYCLE_WIDTH;
  const baseX = startX - age * effect.speed * (0.7 + trait(seed, 4) * 0.6);
  return {
    x: scrollX(baseX, { cameraX, drift: effect.drift, margin: MARGIN }),
    y: effect.y,
    age,
    progress: age / life,
    seed,
  };
}

// puffs trail behind the leading one, each churning up and down on its own
function puffAt(plume, puff) {
  const size = Math.round(3 + plume.progress * 7 + (PUFFS - puff) * 1.5);
  const churn = Math.sin(plume.age * 0.08 + puff * 1.9) * 1.5;
  return {
    x: plume.x + puff * 5,
    y: plume.y - size - puff * 0.5 - plume.progress * 4 + churn,
    size,
  };
}

export function drawPlumes(painter, { effect, tick, cameraX, colors }) {
  const strength = stormStrength(tick);
  painter.use(colors.plume);
  for (let i = 0; i < effect.count; i++) {
    const plume = plumeAt(i, { effect, tick, cameraX });
    const swell = Math.sin(Math.PI * plume.progress);
    const alpha = 0.34 * swell * (0.45 + strength * 0.55);
    for (let puff = 0; puff < PUFFS; puff++) {
      const { x, y, size } = puffAt(plume, puff);
      if (alpha > 0.01 && isOnScreen(x, y, size)) {
        painter.alpha(alpha).rect(x, y, size, size);
      }
    }
  }
  painter.alpha(1);
}
