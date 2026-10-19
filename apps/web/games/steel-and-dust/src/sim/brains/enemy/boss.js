import { startMove } from '../../fighters/actions.js';
import { standStill, walk } from './movement.js';

function chooseAttack(game, boss, distance) {
  if (distance < 46) {
    startMove(game, boss, Math.random() < 0.55 ? 'swipe' : 'slam');
  } else if (distance > 90 && Math.random() < 0.05) {
    startMove(game, boss, 'charge');
  } else {
    walk(boss, 1, 1);
    if (distance < 70 && Math.random() < 0.02) {
      startMove(game, boss, 'slam');
    }
  }
}

export function thinkBoss(game, boss, distance) {
  if (boss.ai.cooldown > 0) {
    if (distance > 42) {
      walk(boss, 1, 1);
    } else {
      standStill(boss);
    }
    return;
  }
  const player = game.player;
  if (player.state === 'down' || player.state === 'getup') {
    standStill(boss);
    return;
  }
  chooseAttack(game, boss, distance);
}
