import { clamp } from '../../../lib/math.js';
import { CYCLE_WIDTH, TAU, isOnScreen, scrollX, trait } from './motion.js';

const SALT = 11000;

function fireflyAt(i, { effect, tick, cameraX }) {
  const seed = i + SALT;
  const middle = (effect.top + effect.bottom) / 2;
  const reachY = ((effect.bottom - effect.top) / 2) * (0.4 + trait(seed, 1) * 0.6);
  const reachX = 10 + trait(seed, 2) * 24;
  const pathX = Math.sin(tick * (0.007 + trait(seed, 3) * 0.01) + trait(seed, 4) * TAU) * reachX;
  const pathY = Math.sin(tick * (0.011 + trait(seed, 5) * 0.014) + trait(seed, 6) * TAU) * reachY;
  const pulse = Math.sin(tick * (0.02 + trait(seed, 7) * 0.03) + trait(seed, 8) * TAU);
  const baseX = trait(seed, 0) * CYCLE_WIDTH + pathX;
  return {
    x: Math.round(scrollX(baseX, { cameraX, drift: effect.drift })),
    y: Math.round(middle + pathY),
    glow: clamp((pulse - 0.1) / 0.5, 0, 1),
  };
}

function drawFirefly(painter, firefly, [coreColor, haloColor]) {
  painter
    .use(haloColor)
    .alpha(firefly.glow * 0.3)
    .rect(firefly.x - 1, firefly.y - 1, 3, 3);
  painter.use(coreColor).alpha(firefly.glow).rect(firefly.x, firefly.y, 1, 1);
}

export function drawFireflies(painter, { effect, tick, cameraX, colors }) {
  for (let i = 0; i < effect.count; i++) {
    const firefly = fireflyAt(i, { effect, tick, cameraX });
    if (firefly.glow > 0 && isOnScreen(firefly.x - 1, firefly.y - 1, 3)) {
      drawFirefly(painter, firefly, colors.fireflies);
    }
  }
  painter.alpha(1);
}
