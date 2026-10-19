import { releaseToken } from '../fighters/tokens.js';

function launchOrKnock(target, { move, direction, knockback, knockdown }) {
  const decay = Math.max(0.4, 1 - target.juggleCount * 0.06);
  const bossScale = target.def.boss ? 0.55 : 1;
  if (move.spike && target.airborne) {
    target.state = 'juggle';
    target.vy = 5;
    target.vx = direction;
    target.groundBounce = !target.groundBounceUsed;
  } else if (move.launch) {
    target.state = 'juggle';
    target.airborne = true;
    target.vy = knockback[1] * decay * bossScale;
    target.vx = direction * knockback[0];
  } else if (knockdown) {
    target.state = 'juggle';
    target.airborne = true;
    target.vy = (knockback[1] || -2.5) * (target.juggleCount ? decay : 1) * bossScale;
    target.vx = direction * knockback[0] * (target.def.boss ? 0.6 : 1);
  } else {
    return false;
  }
  return true;
}

function flinch(target, { move, direction, knockback }) {
  const decay = Math.max(0.4, 1 - target.juggleCount * 0.06);
  if (target.airborne || target.state === 'juggle' || target.state === 'down') {
    target.state = 'juggle';
    target.airborne = true;
    target.vy = Math.min(target.vy, -2.6 * decay);
    target.vx = direction * knockback[0] * 0.6;
    return;
  }
  target.state = 'hurt';
  target.stateTime = move.hitstun;
  target.vx = direction * knockback[0];
}

export function absorbsHit(target, move, damage) {
  const heavyArmor =
    target.def.armor &&
    !move.launch &&
    damage < 13 &&
    target.state !== 'juggle' &&
    !target.airborne;
  const { move: own } = target;
  const moveArmor =
    target.state === 'attack' && own && own.armor && target.moveTime < own.startup + own.active;
  return heavyArmor || moveArmor;
}

export function reactToHit(game, target, reaction) {
  releaseToken(game, target);
  if (target.state === 'attack') {
    target.move = null;
    target.hitboxActive = false;
    target.trail.length = 0;
  }
  if (!launchOrKnock(target, reaction)) {
    flinch(target, reaction);
  }
  if (target.state === 'juggle') {
    target.juggleCount++;
    if (target.juggleCount > 16 && !reaction.move.launch) {
      target.vy = Math.max(target.vy, 0.5);
    }
  }
}
