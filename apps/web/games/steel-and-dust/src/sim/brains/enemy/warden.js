import { standStill, walk } from './movement.js';

const STRIDE_TICKS = 40;
const HALT_TICKS = 14;

// a warden comes on in measured strides, halting between them, and never gives ground
export function warden(boss, { distance, pace }) {
  const ai = boss.ai;
  ai.stride = (ai.stride ?? 0) + 1;
  const halting = ai.stride % (STRIDE_TICKS + HALT_TICKS) >= STRIDE_TICKS;
  if (distance > 46 && !halting) {
    walk(boss, 1, pace);
  } else {
    standStill(boss);
  }
}
