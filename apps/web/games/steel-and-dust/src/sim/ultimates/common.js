import { VIEW_WIDTH } from '../../config.js';
import { applyHit } from '../combat/apply-hit.js';
import { playUltStrike } from '../combat/hit-sound.js';
import { shake } from '../fx/camera-fx.js';

const POSE_LAST_FRAME = 8;

export function ultTargets(game) {
  const left = game.camera.x - 8;
  const right = game.camera.x + VIEW_WIDTH + 8;
  return game.fighters.filter(
    (fighter) =>
      fighter.side === 'enemy' &&
      fighter.state !== 'ko' &&
      !fighter.removed &&
      !fighter.entering &&
      fighter.x > left &&
      fighter.x < right,
  );
}

// the Shade's own ultimate strip, one frame every few ticks, holding on its last frame
export function poseFrame(time, ticks, first = 0) {
  return ['ult', Math.min(POSE_LAST_FRAME, first + Math.floor(time / ticks))];
}

export function hitEveryTarget(game, player, move) {
  playUltStrike(game, move, player.x);
  const facing = player.facing;
  for (const target of ultTargets(game)) {
    player.facing = target.x >= player.x ? 1 : -1;
    applyHit(game, {
      attacker: player,
      target,
      move,
      x: target.x,
      y: target.y - 18 * target.scale,
    });
  }
  player.facing = facing;
}

// the moment the ultimate lands: white-out, a long shake and the world slowed to a crawl
export function finaleFlash(game) {
  game.flashTime = 10;
  shake(game, 6, 24);
  game.io.sfx('ultEnd');
  game.slowMotion = Math.max(game.slowMotion, 36);
}

export function finishUlt(player) {
  Object.assign(player, { invincible: 40, state: 'idle', ultFrame: null, vx: 0, vy: 0 });
}
