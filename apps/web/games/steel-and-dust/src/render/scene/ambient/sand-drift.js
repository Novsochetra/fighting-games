import { CYCLE_WIDTH, TAU, fillClipped, scrollX, trait } from './motion.js';

const SALT = 21000;

// the wind comes in gusts: every streak swells and fades together with a slow swell of its own
function gustOf(tick) {
  return 0.55 + 0.3 * Math.sin(tick * 0.004) + 0.15 * Math.sin(tick * 0.011 + 1.3);
}

function streakAt(i, { effect, tick, cameraX }) {
  const seed = i + SALT;
  const speed = (effect.wind ?? 0.5) * (0.6 + trait(seed, 1) * 0.8);
  const baseX = trait(seed, 0) * CYCLE_WIDTH + tick * speed;
  const span = effect.bottom - effect.top;
  return {
    x: Math.round(scrollX(baseX, { cameraX, drift: effect.drift })),
    y: Math.round(effect.top + trait(seed, 2) * span + Math.sin(tick * 0.02 + i) * 1.5),
    width: 3 + Math.floor(trait(seed, 3) * 9),
    pulse: 0.5 + 0.5 * Math.sin(tick * (0.015 + trait(seed, 4) * 0.02) + trait(seed, 5) * TAU),
  };
}

export function drawSandDrift(painter, { effect, tick, cameraX, colors }) {
  const gust = gustOf(tick);
  for (let i = 0; i < effect.count; i++) {
    const streak = streakAt(i, { effect, tick, cameraX });
    painter.use(colors.sandDrift[i % colors.sandDrift.length]);
    painter.alpha(Math.min(1, gust * streak.pulse * 0.5));
    fillClipped(painter, { x: streak.x, y: streak.y, width: streak.width, height: 1 });
  }
  painter.alpha(1);
}
