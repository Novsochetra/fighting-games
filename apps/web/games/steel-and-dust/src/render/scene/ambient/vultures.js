import { TAU, isOnScreen, scrollX, trait } from './motion.js';

const SALT = 21000;
const WIDTH = 9;
// a long glide with wings held in a shallow V, and the two strokes of a slow flap
const GLIDE = [
  [0, 0, 2, 1],
  [2, 1, 2, 1],
  [4, 2, 1, 1],
  [5, 1, 2, 1],
  [7, 0, 2, 1],
];
const FLAP = [
  [
    [0, 2, 2, 1],
    [2, 1, 2, 1],
    [4, 1, 1, 2],
    [5, 1, 2, 1],
    [7, 2, 2, 1],
  ],
  [
    [1, 0, 2, 1],
    [3, 1, 3, 2],
    [6, 0, 2, 1],
  ],
];

// mostly gliding; now and then a few slow wingbeats
function shapeAt(tick, seed) {
  const beat = (tick + Math.floor(trait(seed, 3) * 400)) % 400;
  return beat < 36 ? FLAP[Math.floor(beat / 9) & 1] : GLIDE;
}

// the birds ride one thermal over the canyon, circling it and drifting slowly as it wanders
function vultureAt(i, { effect, tick, cameraX }) {
  const seed = i + SALT;
  const angle = tick * effect.turn + (i / effect.count) * TAU + trait(seed, 1);
  const reach = effect.radius * (0.75 + trait(seed, 2) * 0.25);
  const centre = effect.x + Math.sin(tick * 0.0011) * 60;
  const centreX = scrollX(centre, { cameraX, drift: effect.drift, margin: effect.radius + WIDTH });
  return {
    x: Math.round(centreX + Math.cos(angle) * reach - WIDTH / 2),
    y: Math.round(effect.y + Math.sin(angle) * reach * 0.3 + i * 3),
    shape: shapeAt(tick, seed),
  };
}

export function drawVultures(painter, { effect, tick, cameraX, colors }) {
  painter.use(colors.vulture);
  for (let i = 0; i < effect.count; i++) {
    const { x, y, shape } = vultureAt(i, { effect, tick, cameraX });
    if (isOnScreen(x, y, WIDTH)) {
      for (const [offsetX, offsetY, width, height] of shape) {
        painter.rect(x + offsetX, y + offsetY, width, height);
      }
    }
  }
}
