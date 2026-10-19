import { startMove } from '../../fighters/actions.js';
import { arenaBounds } from '../../fighters/arena-bounds.js';
import { standStill, walk } from './movement.js';

function canThrow(game, slinger, { distance, playerDown }) {
  return (
    slinger.hasToken &&
    slinger.ai.cooldown <= 0 &&
    !playerDown &&
    distance > 30 &&
    distance < 150 &&
    Math.abs(game.player.y - slinger.y) < 50
  );
}

// holds the middle distance and throws knives
export function thinkSlinger(game, slinger, situation) {
  if (canThrow(game, slinger, situation)) {
    startMove(game, slinger, 'toss');
    return;
  }
  const bounds = arenaBounds(game, slinger);
  const cornered = slinger.x <= bounds.min + 2 || slinger.x >= bounds.max - 2;
  if (situation.distance < 64 && !cornered) {
    walk(slinger, -1, 1);
  } else if (situation.distance > 125) {
    walk(slinger, 1, 1);
  } else {
    standStill(slinger);
  }
}
