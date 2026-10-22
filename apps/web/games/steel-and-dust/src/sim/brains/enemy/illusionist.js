import { startMove } from '../../fighters/actions.js';
import { walk } from './movement.js';

const GLIDE_TICKS = 60;
const BLINK_COOLDOWN = 300;
const BLINK_CHANCE = 0.1;

// crowded, he dissolves into sand and steps out at the far end of the arena, now and then
function blinkAway(game, boss) {
  const ai = boss.ai;
  if (game.tickCount < (ai.blinkReadyAt ?? 0) || Math.random() > BLINK_CHANCE) {
    return false;
  }
  ai.blinkReadyAt = game.tickCount + BLINK_COOLDOWN;
  return startMove(game, boss, 'mirageBlink');
}

// an illusionist glides at the middle distance, slowly to and fro, and is gone from a hero who
// crowds him
export function illusionist(boss, { game, distance, pace }) {
  const ai = boss.ai;
  if (distance < 56 && blinkAway(game, boss)) {
    return;
  }
  if (distance > 170) {
    walk(boss, 1, pace);
  } else if (distance < 90) {
    walk(boss, -1, 0.8 * pace);
  } else {
    ai.glide = (ai.glide ?? 0) + 1;
    walk(boss, Math.floor(ai.glide / GLIDE_TICKS) % 2 ? -1 : 1, 0.5 * pace);
  }
}
