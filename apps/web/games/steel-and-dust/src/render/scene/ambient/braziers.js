import { emitterSpots } from './emitters.js';
import { fillClipped } from './motion.js';

// a brazier's light spills wider than the bowl and reaches higher than the flame
const HALO_LAYERS = [
  [40, 10, 6],
  [32, 16, 10],
  [24, 22, 14],
  [16, 28, 19],
  [8, 34, 25],
];
// a bowl burns with a tall middle tongue and two shorter ones that flicker out of step with it
const TONGUES = [
  { offset: -5, scale: 0.6, phase: 2.1 },
  { offset: 5, scale: 0.7, phase: 4.4 },
  { offset: 0, scale: 1, phase: 0 },
];
const BASE_WIDTH = 7;
const TALLEST = 14;

function flickerOf(seed, tick) {
  return Math.sin(tick * 0.31 + seed * 2.7) * 0.6 + Math.sin(tick * 0.83 + seed) * 0.4;
}

function drawHalo(painter, spot, { tick, color }) {
  painter.use(color).alpha(0.045 + flickerOf(spot.index, tick) * 0.015);
  for (const [width, height, lift] of HALO_LAYERS) {
    fillClipped(painter, { x: spot.x - width / 2, y: spot.y - lift, width, height });
  }
}

// the tip sways further than the root, so the flame licks instead of sliding sideways
function rowOf(root, { row, height, tick }) {
  const rise = row / height;
  const width = Math.max(1, Math.round(BASE_WIDTH * (1 - rise * rise)));
  const sway = Math.round(Math.sin(tick * 0.27 + row * 0.7 + root.seed * 1.9) * rise * 2);
  return { x: root.x - Math.floor(width / 2) + sway, y: root.y - row - 1, width, rise };
}

function drawTongue(painter, root, { tick, colors }) {
  const [core, middle, outer] = colors;
  const height = Math.round((TALLEST + flickerOf(root.seed, tick) * 3) * root.scale);
  for (let row = 0; row < height; row++) {
    const { x, y, width, rise } = rowOf(root, { row, height, tick });
    painter.use(outer).alpha(1 - rise * 0.6);
    fillClipped(painter, { x, y, width, height: 1 });
    if (width > 2) {
      painter.use(rise < 0.3 ? core : middle);
      fillClipped(painter, { x: x + 1, y, width: width - 2, height: 1 });
    }
  }
}

// the bowls are painted into the near layer; only the fire is drawn, so it can flicker
export function drawBraziers(painter, { effect, tick, cameraX, colors }) {
  for (const spot of emitterSpots(effect, cameraX)) {
    drawHalo(painter, spot, { tick, color: colors.flameGlow });
    for (const { offset, scale, phase } of TONGUES) {
      const root = { x: spot.x + offset, y: spot.y, scale, seed: spot.index + phase };
      drawTongue(painter, root, { tick, colors: colors.flame });
    }
  }
  painter.alpha(1);
}
