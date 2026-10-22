import { POP_TICKS } from '../../sim/bosses/mirage-run.js';
import { drawEnemyFrame } from './enemy-sprites.js';

const POP_FRAME_TICKS = POP_TICKS / 3;
const FLICKER_EVERY = 48;

// a copy moves as the boss moves; it thrusts its staff to fire, and dissolves (mirage 3-5) when popped
export function mirageFrame(mirage, bossFrame) {
  if (mirage.popTime >= 0) {
    return ['mirage', Math.min(5, 3 + Math.floor(mirage.popTime / POP_FRAME_TICKS))];
  }
  if (mirage.cast >= 0) {
    return ['scarabCarpet', Math.min(3, 1 + Math.floor(mirage.cast / 8))];
  }
  return bossFrame;
}

// only sand and light: a copy is a shade thinner than him, and wavers now and then like heat
function mirageAlpha(mirage, tickCount) {
  if (mirage.popTime >= 0) {
    return 0.85 * (1 - mirage.popTime / POP_TICKS);
  }
  return (tickCount + mirage.x) % FLICKER_EVERY < 2 ? 0.55 : 0.85;
}

export function drawMirages(painter, sheets, { fighter, frame, tickCount }) {
  if (!fighter.mirages?.length) {
    return;
  }
  for (const mirage of fighter.mirages) {
    painter.alpha(mirageAlpha(mirage, tickCount));
    drawEnemyFrame(painter, sheets, {
      id: fighter.def.sprite,
      frame: mirageFrame(mirage, frame),
      x: mirage.x,
      y: mirage.y,
      facing: mirage.facing,
    });
  }
  painter.alpha(1);
}
