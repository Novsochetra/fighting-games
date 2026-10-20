import { VIEW_WIDTH } from '../../../config.js';
import { hashInt } from '../../../lib/math.js';
import { isOnScreen, trait, twoFrame } from './motion.js';

const SALT = 4100;
const CROSS_TICKS = 720;
const BIRD_WIDTH = 5;
const FLOCK_SPAN = 32;
const TRAVEL = VIEW_WIDTH + FLOCK_SPAN + BIRD_WIDTH * 2;
const WING_FRAMES = [
  [
    [0, 0, 1, 1],
    [4, 0, 1, 1],
    [1, 1, 3, 1],
  ],
  [
    [1, 0, 3, 1],
    [0, 1, 1, 1],
    [4, 1, 1, 1],
  ],
];

function drawBird(painter, { x, y, frame }) {
  if (!isOnScreen(x, y, BIRD_WIDTH)) {
    return;
  }
  const left = Math.round(x);
  const top = Math.round(y);
  for (const [offsetX, offsetY, width, height] of WING_FRAMES[frame]) {
    painter.rect(left + offsetX, top + offsetY, width, height);
  }
}

function flockOf(crossing) {
  const seed = crossing + SALT;
  return { seed, size: 3 + (hashInt(seed) % 3), lift: Math.round(trait(seed, 1) * 16) - 8 };
}

export function drawBirds(painter, { effect, tick, colors }) {
  const crossTicks = Math.min(effect.period, CROSS_TICKS);
  const crossing = Math.floor(tick / effect.period);
  const elapsed = tick - crossing * effect.period;
  if (elapsed >= crossTicks) {
    return;
  }
  const flock = flockOf(crossing);
  const leaderX = VIEW_WIDTH + BIRD_WIDTH - (elapsed / crossTicks) * TRAVEL;
  painter.use(colors.bird);
  for (let i = 0; i < flock.size; i++) {
    const rank = Math.ceil(i / 2);
    const side = i % 2 ? -1 : 1;
    drawBird(painter, {
      x: leaderX + rank * 11 + trait(flock.seed, i + 2) * 3,
      y: effect.y + flock.lift + side * rank * 4 + Math.sin(tick * 0.06 + i * 1.3) * 1.5,
      frame: twoFrame(tick + i * 5, 9),
    });
  }
}
