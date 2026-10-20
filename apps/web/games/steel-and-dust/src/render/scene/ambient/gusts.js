import { clamp } from '../../../lib/math.js';
import { CYCLE_WIDTH, TAU, fillClipped, scrollX, trait } from './motion.js';
import { stormStrength } from './storm.js';

const SALT = 17000;

// the wind blows against the hero, so streaks run right to left; the margin is a whole streak
// long, so one wraps round only once it is out of sight
function streakAt(i, { effect, tick, cameraX }) {
  const seed = i + SALT;
  const speed = effect.speed * (0.6 + trait(seed, 2) * 0.8);
  const length = Math.max(2, Math.round(effect.length * (0.35 + trait(seed, 3) * 0.65)));
  const sway = Math.sin(tick * 0.05 + trait(seed, 5) * TAU) * 1.5;
  const baseX = trait(seed, 0) * CYCLE_WIDTH - tick * speed;
  return {
    x: Math.round(scrollX(baseX, { cameraX, drift: effect.drift, margin: effect.length })),
    y: Math.round(effect.top + trait(seed, 4) * (effect.bottom - effect.top) + sway),
    length,
    calm: trait(seed, 1),
  };
}

// a bright head and a fainter tail trailing behind it
function drawStreak(painter, streak, { colors, alpha }) {
  const head = Math.max(1, Math.round(streak.length / 3));
  painter.use(colors[0]).alpha(alpha);
  fillClipped(painter, { x: streak.x, y: streak.y, width: head, height: 1 });
  painter.use(colors[1]).alpha(alpha * 0.6);
  fillClipped(painter, {
    x: streak.x + head,
    y: streak.y,
    width: streak.length - head,
    height: 1,
  });
}

// the stronger the storm, the more streaks blow and the brighter they are; a streak fades in and
// out as the storm crosses its own calm level rather than popping
export function drawGusts(painter, { effect, tick, cameraX, colors }) {
  const strength = stormStrength(tick);
  const shown = 0.3 + strength * 0.7;
  const alpha = (effect.alpha ?? 0.6) * (0.55 + strength * 0.45);
  for (let i = 0; i < effect.count; i++) {
    const streak = streakAt(i, { effect, tick, cameraX });
    const fade = clamp((shown - streak.calm) / 0.15, 0, 1);
    if (fade > 0) {
      drawStreak(painter, streak, { colors: colors.gusts, alpha: alpha * fade });
    }
  }
  painter.alpha(1);
}
