import { emitterSpots } from './emitters.js';
import { drawFlameGlow } from './flame-glow.js';
import { flameLayers, flameTongues } from './flame-shape.js';
import { fillClipped, isOnScreen, trait } from './motion.js';

const SALT = 25000;
const HEIGHT = 11;

function drawLayer(painter, spot, rows) {
  rows.forEach((spans, row) => {
    for (const [left, right] of spans) {
      fillClipped(painter, {
        x: spot.x + left,
        y: spot.y - 1 - row,
        width: right - left,
        height: 1,
      });
    }
  });
}

// now and then a lick of flame tears off the tip and rises a few pixels before it dies
function drawLick(painter, spot, { tick, height, color }) {
  const cycle = 20 + (spot.index % 3) * 5;
  const clock = tick + spot.index * 7;
  const lick = Math.floor(clock / cycle);
  const age = clock - lick * cycle;
  const seed = (spot.index + SALT) * 613 + lick;
  if (age > 10 || trait(seed, 1) < 0.35) {
    return;
  }
  const x = spot.x + Math.round((trait(seed, 2) - 0.5) * 3);
  const y = spot.y - Math.round(height * 0.85 + age * 0.5);
  if (isOnScreen(x, y, 2)) {
    painter.use(color).rect(x, y, 1, age < 5 ? 2 : 1);
  }
}

function drawFlame(painter, spot, { tick, colors }) {
  const height = HEIGHT + Math.floor(trait(spot.index + SALT, 2) * 3);
  const layers = flameLayers(flameTongues(spot, { tick, height }), colors.length);
  painter.alpha(1);
  layers.forEach((rows, depth) => {
    painter.use(colors[colors.length - 1 - depth]);
    drawLayer(painter, spot, rows);
  });
  drawLick(painter, spot, { tick, height, color: colors[Math.max(0, colors.length - 2)] });
}

export function drawFlames(painter, { effect, tick, cameraX, colors }) {
  for (const spot of emitterSpots(effect, cameraX)) {
    if (colors.glow) {
      const center = { x: spot.x, y: spot.y - 6 };
      drawFlameGlow(painter, center, { tick, index: spot.index, color: colors.glow });
    }
    drawFlame(painter, spot, { tick, colors: colors.flames });
  }
  painter.alpha(1);
}
