import { COLORS } from '../../art/colors.js';
import { GROUND_Y, VIEW_WIDTH } from '../../config.js';
import { randomBetween } from '../../lib/math.js';
import { applyHit } from '../combat/apply-hit.js';
import { attackBox, hurtBox, overlaps } from '../combat/boxes.js';
import { shake } from '../fx/camera-fx.js';
import { addDust } from '../fx/particles.js';
import { spawnShockwave } from './shockwaves.js';

function canBeQuaked(target, attacker) {
  return (
    target.side !== attacker.side &&
    !target.airborne &&
    !target.entering &&
    Math.abs(target.x - attacker.x) < VIEW_WIDTH
  );
}

// every grounded enemy on screen that the swing itself misses is launched
export function quake(game, attacker, move) {
  spawnShockwave(game, attacker);
  shake(game, 5, 22);
  const launch = {
    damage: move.quakeDamage,
    knockback: [1.6, -5],
    launch: true,
    knockAway: true,
    hitstop: 6,
    hitstun: 20,
  };
  const swing = attackBox(attacker, move.hitbox);
  for (const target of game.fighters) {
    if (!canBeQuaked(target, attacker)) {
      continue;
    }
    const body = hurtBox(target);
    if (!body || overlaps(swing, body)) {
      continue;
    }
    addDust(game, { x: target.x, y: GROUND_Y, count: 6 });
    if (applyHit(game, { attacker, target, move: launch, x: target.x, y: GROUND_Y - 8 })) {
      attacker.hitTargets.add(target);
    }
  }
}

function canBePulled(target, attacker) {
  return (
    target.side !== attacker.side &&
    target.state !== 'ko' &&
    !target.entering &&
    target.hitstop === 0
  );
}

export function pullIn(game, attacker) {
  for (const target of game.fighters) {
    if (!canBePulled(target, attacker)) {
      continue;
    }
    const dx = attacker.x - target.x;
    if (Math.abs(dx) < 80 && Math.abs(dx) > 10) {
      target.x += Math.sign(dx) * 1.3;
    }
  }
  if (game.tickCount % 2 === 0) {
    const side = Math.random() < 0.5 ? -1 : 1;
    game.particles.push({
      kind: 'spark',
      x: attacker.x + side * 60,
      y: attacker.y - randomBetween(4, 36),
      vx: -side * 3,
      vy: 0,
      life: 12,
      maxLife: 14,
      color: COLORS.frost,
    });
  }
}
