import { CYCLE_WIDTH, TAU, isOnScreen, scrollX, trait, wrapX } from './motion.js';

const SALT = 9000;

function moteAt(i, { effect, tick, cameraX }) {
  const seed = i + SALT;
  const span = effect.bottom - effect.top;
  const rise = 0.04 + trait(seed, 1) * 0.1;
  const wanderRate = 0.01 + trait(seed, 2) * 0.01;
  const wander = Math.sin(tick * wanderRate + trait(seed, 3) * TAU) * 6;
  const baseX = trait(seed, 0) * CYCLE_WIDTH + tick * 0.04 + wander;
  const twinkleRate = 0.03 + trait(seed, 5) * 0.06;
  return {
    x: scrollX(baseX, { cameraX, drift: effect.drift }),
    y: effect.bottom - wrapX(trait(seed, 4) * span + tick * rise, span),
    twinkle: 0.5 + 0.5 * Math.sin(tick * twinkleRate + trait(seed, 6) * TAU),
  };
}

export function drawMotes(painter, { effect, tick, cameraX, colors }) {
  painter.use(colors.mote);
  for (let i = 0; i < effect.count; i++) {
    const mote = moteAt(i, { effect, tick, cameraX });
    if (mote.twinkle > 0.1 && isOnScreen(mote.x, mote.y, 1)) {
      painter.alpha(0.15 + mote.twinkle * 0.7).rect(mote.x, mote.y, 1, 1);
    }
  }
  painter.alpha(1);
}
