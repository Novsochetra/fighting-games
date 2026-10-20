import { shadeColor } from '../../../lib/color.js';
import { CYCLE_WIDTH, TAU, isOnScreen, scrollX, trait } from './motion.js';

const SALT = 21000;
const WIDTH = 5;
// [x, y, width, height] wing rects and the dark body, wings spread and wings raised
const POSES = [
  {
    wings: [
      [0, 0, 2, 2],
      [3, 0, 2, 2],
      [1, 2, 1, 1],
      [3, 2, 1, 1],
    ],
    body: [2, 1, 1, 1],
  },
  {
    wings: [
      [1, 0, 1, 2],
      [3, 0, 1, 2],
    ],
    body: [2, 1, 1, 2],
  },
];

// two slow swings and a long sideways wander make a lazy looping path; a beat of the wings
// lifts the body a pixel, and now and then it glides with its wings spread
function butterflyAt(i, { effect, tick, cameraX }) {
  const seed = i + SALT;
  const swing = (slot, rate, reach) =>
    Math.sin(tick * rate * (0.6 + trait(seed, slot) * 0.8) + trait(seed, slot + 1) * TAU) * reach;
  const wander = (trait(seed, 9) - 0.5) * 0.12 * tick;
  const baseX = trait(seed, 0) * CYCLE_WIDTH + wander + swing(1, 0.013, 22) + swing(3, 0.031, 6);
  const middle = (effect.top + effect.bottom) / 2;
  const reachY = (effect.bottom - effect.top) / 2 - 3;
  const gliding = Math.sin(tick * 0.017 + trait(seed, 5) * TAU) > 0.75;
  const pose = gliding ? 0 : Math.floor((tick + seed) / (4 + (i % 3))) & 1;
  return {
    x: Math.round(scrollX(baseX, { cameraX, drift: effect.drift })),
    y: Math.round(middle + swing(6, 0.019, reachY * 0.7) + swing(11, 0.047, reachY * 0.3)) - pose,
    pose: POSES[pose],
  };
}

function drawButterfly(painter, butterfly, { wing, body }) {
  const { x, y, pose } = butterfly;
  painter.use(wing);
  for (const [offsetX, offsetY, width, height] of pose.wings) {
    painter.rect(x + offsetX, y + offsetY, width, height);
  }
  const [offsetX, offsetY, width, height] = pose.body;
  painter.use(body).rect(x + offsetX, y + offsetY, width, height);
}

export function drawButterflies(painter, { effect, tick, cameraX, colors }) {
  const shades = colors.butterflies.map((wing) => ({ wing, body: shadeColor(wing, -0.6) }));
  for (let i = 0; i < effect.count; i++) {
    const butterfly = butterflyAt(i, { effect, tick, cameraX });
    if (isOnScreen(butterfly.x, butterfly.y, WIDTH)) {
      drawButterfly(painter, butterfly, shades[i % shades.length]);
    }
  }
}
