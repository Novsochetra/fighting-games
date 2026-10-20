import { VIEW_WIDTH } from '../../../config.js';
import { hashInt } from '../../../lib/math.js';
import { isOnScreen, trait, twoFrame } from './motion.js';

const SALT = 19000;
const CROSS_TICKS = 640;
const BAT_WIDTH = 7;
const SPREAD = 40;
const TRAVEL = VIEW_WIDTH + SPREAD + BAT_WIDTH * 2;
const WING_FRAMES = [
  [
    [0, 0, 1, 1],
    [6, 0, 1, 1],
    [1, 1, 2, 1],
    [4, 1, 2, 1],
    [3, 1, 1, 2],
  ],
  [
    [3, 0, 1, 1],
    [1, 1, 5, 1],
    [0, 2, 1, 1],
    [6, 2, 1, 1],
  ],
];

function drawBat(painter, { x, y, frame }) {
  if (!isOnScreen(x, y, BAT_WIDTH)) {
    return;
  }
  const left = Math.round(x);
  const top = Math.round(y);
  for (const [offsetX, offsetY, width, height] of WING_FRAMES[frame]) {
    painter.rect(left + offsetX, top + offsetY, width, height);
  }
}

function colonyOf(crossing) {
  const seed = crossing + SALT;
  return {
    seed,
    size: 2 + (hashInt(seed) % 3),
    heading: hashInt(seed + 1) % 2 ? 1 : -1,
    lift: Math.round(trait(seed, 1) * 24) - 12,
  };
}

// bats never fly straight: each one darts back and forth and bobs on its own beat
function batAt(colony, { i, progress, tick }) {
  const seed = colony.seed * 7 + i;
  const along = progress * TRAVEL - BAT_WIDTH - trait(seed, 2) * SPREAD;
  const dart = Math.sin(tick * (0.05 + trait(seed, 3) * 0.04) + i * 2.1) * 10;
  const x = colony.heading > 0 ? along + dart : VIEW_WIDTH - along + dart;
  const bob = Math.sin(tick * 0.13 + i * 1.3) * 3 + Math.sin(tick * 0.031 + i) * 7;
  return { x, y: colony.lift + i * 5 + bob, frame: twoFrame(tick + i * 2, 4) };
}

export function drawBats(painter, { effect, tick, colors }) {
  const crossTicks = Math.min(effect.period, CROSS_TICKS);
  const crossing = Math.floor(tick / effect.period);
  const elapsed = tick - crossing * effect.period;
  if (elapsed >= crossTicks) {
    return;
  }
  const colony = colonyOf(crossing);
  painter.use(colors.bat);
  for (let i = 0; i < colony.size; i++) {
    const bat = batAt(colony, { i, progress: elapsed / crossTicks, tick });
    drawBat(painter, { ...bat, y: effect.y + bat.y });
  }
}
