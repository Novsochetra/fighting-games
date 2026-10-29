import { VIEW_HEIGHT } from '../../../config.js';
import { lastOf } from '../../../lib/lists.js';
import { CYCLE_WIDTH, TAU, isOnScreen, scrollX, trait, twoFrame, wrapX } from './motion.js';

const SALT = 21000;
const FALL_SPAN = VIEW_HEIGHT + 8;
// the last color of the palette is a cinder still alight; one flake in this many carries it
const CINDER_EVERY = 6;

function flakeAt(i, { effect, tick, cameraX }) {
  const seed = i + SALT;
  const fall = 0.06 + trait(seed, 1) * 0.12;
  const swayRate = 0.012 + trait(seed, 2) * 0.02;
  const sway = Math.sin(tick * swayRate + trait(seed, 3) * TAU) * (3 + trait(seed, 4) * 6);
  const baseX = trait(seed, 0) * CYCLE_WIDTH + tick * (effect.wind ?? 0) + sway;
  return {
    x: scrollX(baseX, { cameraX, drift: effect.drift }),
    y: wrapX(trait(seed, 5) * FALL_SPAN + tick * fall, FALL_SPAN) - 4,
    tumble: twoFrame(tick + seed * 5, 11 + Math.floor(trait(seed, 6) * 12)),
    glow: Math.sin(tick * 0.09 + seed),
  };
}

function drawFlake(painter, flake, color) {
  painter
    .use(color)
    .alpha(0.75)
    .rect(flake.x, flake.y, flake.tumble ? 2 : 1, 1);
}

function drawCinder(painter, flake, color) {
  if (flake.glow > -0.3) {
    painter
      .use(color)
      .alpha(0.45 + 0.4 * Math.max(0, flake.glow))
      .rect(flake.x, flake.y, 1, 1);
  }
}

// soot and ash sifting down out of the smog, tumbling as it falls, now and then a live cinder
export function drawAsh(painter, { effect, tick, cameraX, colors }) {
  const flakes = colors.ash.slice(0, -1);
  const cinder = lastOf(colors.ash);
  for (let i = 0; i < effect.count; i++) {
    const flake = flakeAt(i, { effect, tick, cameraX });
    if (!isOnScreen(flake.x, flake.y, 2)) {
      continue;
    }
    if (i % CINDER_EVERY === CINDER_EVERY - 1) {
      drawCinder(painter, flake, cinder);
    } else {
      drawFlake(painter, flake, flakes[i % flakes.length]);
    }
  }
  painter.alpha(1);
}
