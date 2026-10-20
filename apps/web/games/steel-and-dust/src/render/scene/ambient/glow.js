import { emitterSpots } from './emitters.js';
import { fillClipped } from './motion.js';

// stacked translucent boxes add up to a brighter core: a soft pool of light without gradients;
// each is [share of the width, share of the height, which color, alpha at no heat, extra at full]
const LAYERS = [
  [1, 1, 0, 0.05, 0.1],
  [0.7, 0.75, 0, 0.06, 0.12],
  [0.4, 0.5, 1, 0.06, 0.18],
];

// a slow throb with a quicker flicker over it, offset per furnace so they never beat together
export function heatAt(tick, index) {
  const throb = Math.sin(tick * 0.035 + index * 2.1);
  const flicker = Math.sin(tick * 0.27 + index * 1.3) * 0.6 + Math.sin(tick * 0.71 + index) * 0.4;
  return Math.min(1, Math.max(0, 0.5 + throb * 0.35 + flicker * 0.15));
}

function drawPool(painter, spot, { effect, heat, colors }) {
  const swell = 1 + heat * 0.12;
  for (const [shareX, shareY, colorIndex, base, extra] of LAYERS) {
    const width = Math.round(effect.width * shareX * swell);
    const height = Math.round(effect.height * shareY * swell);
    painter.use(colors[colorIndex]).alpha(base + extra * heat);
    fillClipped(painter, {
      x: spot.x - (width >> 1),
      y: spot.y - (height >> 1),
      width,
      height,
    });
  }
}

// the light of a furnace mouth in the near layer, breathing as the fire inside is worked
export function drawGlow(painter, { effect, tick, cameraX, colors }) {
  for (const spot of emitterSpots(effect, cameraX)) {
    const heat = heatAt(tick, spot.index);
    drawPool(painter, spot, { effect, heat, colors: colors.furnace });
  }
  painter.alpha(1);
}
