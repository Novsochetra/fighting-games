import { enemySpriteFrame } from '../enemy-animation.js';
import { bodyPoint } from '../fighters/body-point.js';

// where the chain leaves his fist on each frame that holds it, in his own units (body-point.js)
export const FIST_ON_FRAME = {
  3: { ahead: 33, up: 28 },
  4: { ahead: 20, up: 21 },
  5: { ahead: 13, up: 16 },
};

export function fistOf(boss) {
  const [, frame] = enemySpriteFrame(boss);
  return bodyPoint(boss, FIST_ON_FRAME[frame] ?? FIST_ON_FRAME[3]);
}
