import { standStill, walk } from './movement.js';

const GLIDE_TICKS = 26;
const REST_TICKS = 20;

// a glider moves in smooth bursts over the stone, rearing up between them: she glides in on a hero
// far off, glides back from one who crowds her, and at the middle distance sways in and out
export function glider(boss, { distance, pace }) {
  const ai = boss.ai;
  ai.glide = ((ai.glide ?? 0) + 1) % (GLIDE_TICKS + REST_TICKS);
  if (ai.glide >= GLIDE_TICKS) {
    standStill(boss);
    return;
  }
  if (distance > 200) {
    walk(boss, 1, 1.4 * pace);
  } else if (distance < 90) {
    walk(boss, -1, 1.3 * pace);
  } else {
    ai.sway = (ai.sway ?? 0) + (ai.glide === 0 ? 1 : 0);
    walk(boss, ai.sway % 2 ? -1 : 1, 0.7 * pace);
  }
}
