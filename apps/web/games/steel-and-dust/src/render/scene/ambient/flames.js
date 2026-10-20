import { emitterSpots } from './emitters.js';
import { fillClipped, isOnScreen } from './motion.js';

// [width, height, alpha] of each glow layer, in flame sizes: stacked, they make a warm pool of
// light that is brightest at the fire
const GLOW_LAYERS = [
  [5, 3, 0.05],
  [3.2, 2.4, 0.06],
  [1.8, 1.8, 0.08],
];

// two sines at unrelated rates, phased per fire, read as an irregular flicker between 0 and 1
export function flickerAt(index, tick) {
  return (
    0.5 + 0.3 * Math.sin(tick * 0.31 + index * 1.7) + 0.2 * Math.sin(tick * 0.83 + index * 4.1)
  );
}

function drawGlow(painter, spot, { size, flicker, color }) {
  painter.use(color);
  const centerY = spot.y - size / 2;
  for (const [width, height, alpha] of GLOW_LAYERS) {
    const box = { width: Math.round(width * size), height: Math.round(height * size) };
    painter.alpha(alpha * (0.7 + flicker * 0.6));
    fillClipped(painter, {
      ...box,
      x: Math.round(spot.x - box.width / 2),
      y: Math.round(centerY - box.height / 2),
    });
  }
}

// each row narrows toward the tip and leans on a wave that climbs the flame, so it licks upward
function tongueRow(spot, { row, height, size, tick }) {
  const progress = row / height;
  const width = Math.max(1, Math.round(size * 0.7 * (1 - progress * progress)));
  const lean = Math.round(Math.sin(tick * 0.27 - row * 0.7 + spot.index * 2.3) * progress * 1.6);
  return { x: Math.round(spot.x - width / 2) + lean, y: spot.y - row - 1, width };
}

function drawTongue(painter, spot, { size, flicker, tick, colors }) {
  const [outer, middle, core] = colors;
  const height = Math.max(2, Math.round(size * (0.75 + flicker * 0.5)));
  for (let row = 0; row < height; row++) {
    const slice = tongueRow(spot, { row, height, size, tick });
    if (!isOnScreen(slice.x, slice.y, slice.width)) {
      continue;
    }
    painter.use(row > height * 0.6 ? outer : middle).rect(slice.x, slice.y, slice.width, 1);
    if (slice.width > 2 && row < height * 0.5) {
      painter.use(core).rect(slice.x + 1, slice.y, slice.width - 2, 1);
    }
  }
}

export function drawFlames(painter, { effect, tick, cameraX, colors }) {
  const size = effect.size ?? 6;
  for (const spot of emitterSpots(effect, cameraX)) {
    const flicker = flickerAt(spot.index, tick);
    drawGlow(painter, spot, { size, flicker, color: colors.glow });
    painter.alpha(0.9);
    drawTongue(painter, spot, { size, flicker, tick, colors: colors.flame });
  }
  painter.alpha(1);
}
