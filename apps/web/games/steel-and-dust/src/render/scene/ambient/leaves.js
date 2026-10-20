import { VIEW_HEIGHT } from '../../../config.js';
import { shadeColor } from '../../../lib/color.js';
import { CYCLE_WIDTH, TAU, isOnScreen, scrollX, trait, twoFrame, wrapX } from './motion.js';

const SALT = 7000;
const FALL_SPAN = VIEW_HEIGHT + 8;

function leafAt(i, { effect, tick, cameraX }) {
  const seed = i + SALT;
  const fall = 0.25 + trait(seed, 1) * 0.35;
  const swayRate = 0.02 + trait(seed, 2) * 0.03;
  const sway = Math.sin(tick * swayRate + trait(seed, 3) * TAU) * (2 + trait(seed, 4) * 4);
  const baseX = trait(seed, 0) * CYCLE_WIDTH + tick * (effect.wind ?? 0) + sway;
  return {
    x: scrollX(baseX, { cameraX, drift: effect.drift }),
    y: wrapX(trait(seed, 5) * FALL_SPAN + tick * fall, FALL_SPAN) - 4,
    frame: twoFrame(tick + seed * 3, 7 + Math.floor(trait(seed, 6) * 8)),
  };
}

function drawLeaf(painter, leaf, shade) {
  const [width, height] = leaf.frame ? [1, 2] : [2, 1];
  painter.use(shade.body).rect(leaf.x, leaf.y, width, height);
  painter.use(shade.light).rect(leaf.x, leaf.y, 1, 1);
}

export function drawLeaves(painter, { effect, tick, cameraX, colors }) {
  const shades = colors.leaves.map((color) => ({ body: color, light: shadeColor(color, 0.35) }));
  for (let i = 0; i < effect.count; i++) {
    const leaf = leafAt(i, { effect, tick, cameraX });
    if (isOnScreen(leaf.x, leaf.y, 2)) {
      drawLeaf(painter, leaf, shades[i % shades.length]);
    }
  }
}
