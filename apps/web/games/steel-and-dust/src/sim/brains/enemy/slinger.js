import { startMove } from '../../fighters/actions.js';
import { arenaBounds } from '../../fighters/arena-bounds.js';
import { standStill, walk } from './movement.js';
import { thinkPerch } from './perch.js';

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

function keepDistance(game, slinger, distance, [near, far]) {
  const bounds = arenaBounds(game, slinger);
  const cornered = slinger.x <= bounds.min + 2 || slinger.x >= bounds.max - 2;
  if (distance < near && !cornered) {
    walk(slinger, -1, 1);
  } else if (distance > far) {
    walk(slinger, 1, 1);
  } else {
    standStill(slinger);
  }
}

// holds the middle distance and throws knives, fire pots, bolts or sand, from a platform when
// there is one near
export function thinkSlinger(game, slinger, situation) {
  const keepAway = slinger.def.keepAway || DEFAULT_KEEP_AWAY;
  const perch = thinkPerch(game, slinger, situation.distance, keepAway);
  if (perch === 'moving') {
    return;
  }
  if (canThrow(game, slinger, situation)) {
    startMove(game, slinger, slinger.def.rangedMove || 'toss');
  } else if (perch === 'perched') {
    standStill(slinger);
  } else {
    keepDistance(game, slinger, situation.distance, keepAway);
  }
}
