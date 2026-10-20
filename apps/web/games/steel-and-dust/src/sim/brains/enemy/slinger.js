import { startMove } from '../../fighters/actions.js';
import { arenaBounds } from '../../fighters/arena-bounds.js';
import { standStill, walk } from './movement.js';

const DEFAULT_KEEP_AWAY = [64, 125];

function canThrow(game, slinger, { distance, playerDown }) {
  return (
    slinger.hasToken &&
    slinger.ai.cooldown <= 0 &&
    !playerDown &&
    distance > 30 &&
    distance < slinger.def.range + 40 &&
    Math.abs(game.player.y - slinger.y) < 50
  );
}

// holds the middle distance and throws knives, fire pots, bolts or sand
export function thinkSlinger(game, slinger, situation) {
  if (canThrow(game, slinger, situation)) {
    startMove(game, slinger, slinger.def.rangedMove || 'toss');
    return;
  }
  const [near, far] = slinger.def.keepAway || DEFAULT_KEEP_AWAY;
  const bounds = arenaBounds(game, slinger);
  const cornered = slinger.x <= bounds.min + 2 || slinger.x >= bounds.max - 2;
  if (situation.distance < near && !cornered) {
    walk(slinger, -1, 1);
  } else if (situation.distance > far) {
    walk(slinger, 1, 1);
  } else {
    standStill(slinger);
  }
}
