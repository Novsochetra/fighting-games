import { COLORS } from '../../art/colors.js';
import { difficultyOf } from '../../data/difficulty.js';
import { isPlayer } from '../fighters/loadout.js';
import { addFloatText } from '../fx/effects.js';
import { burstMaterial } from '../fx/material-bursts.js';
import { blockHit } from './block-hit.js';
import { addUltMeter, endCombo } from './combo.js';
import { blocksHit, canBeHit, isFacing, isGuarding } from './guard.js';
import { feelHit, showBigHit, showDamageNumber, showImpact } from './hit-feedback.js';
import { absorbsHit, reactToHit } from './hit-reaction.js';
import { playHitSound } from './hit-sound.js';
import { knockOut } from './knock-out.js';
import { shout } from './sounds.js';

function damageOf(game, target, move) {
  return isPlayer(target)
    ? Math.max(1, Math.round(move.damage * difficultyOf(game.settings).damage))
    : move.damage;
}

function hitDirection({ attacker, target, move }) {
  if (move.knockAway) {
    return target.x >= attacker.x ? 1 : -1;
  }
  return attacker.facing;
}

function announceGuardBreak(game, { attacker, target }) {
  if (target.def.shield && isGuarding(target) && isFacing(target, attacker)) {
    addFloatText(game, {
      x: target.x,
      y: target.y - 44 * target.scale,
      text: 'guard break!',
      color: COLORS.orange,
    });
    game.io.sfx('break');
  }
}

function chargeMeters(game, { attacker, target, move }, damage) {
  if (isPlayer(attacker) && !move.ultimate) {
    addUltMeter(game, damage * 0.8);
  } else if (isPlayer(target)) {
    addUltMeter(game, damage);
  }
}

function freezeOnHit({ attacker, target, move }, damage) {
  target.hp -= damage;
  target.hpBarTime = 90;
  target.flashTime = 4;
  attacker.hitstop = move.hitstop;
  target.hitstop = move.hitstop;
  target.hitShake = move.hitstop;
}

function countPlayerHit(game, { attacker, move }, damage) {
  const combo = game.combo;
  combo.count++;
  combo.timer = 110;
  combo.damage += damage;
  combo.bump = 6;
  game.score += Math.round(damage * 10 * (1 + Math.min(combo.count, 50) / 25));
  if (attacker.airborne && attacker.airHits < 5 && !move.dive && !move.ultimate) {
    attacker.vy = Math.min(attacker.vy, -1.4);
    attacker.airHits++;
  }
}

function isLastOfMultiHit({ attacker, move }) {
  return !move.multiHit || attacker.moveTime >= move.startup + move.active - move.multiHit;
}

function isBigHit(move, knockdown) {
  return move.hitstop >= 9 || move.launch || knockdown || (move.ultimate && move.launch);
}

function scoreHit(game, hit, damage) {
  hit.attacker.hitConfirmed = true;
  if (isPlayer(hit.attacker)) {
    countPlayerHit(game, hit, damage);
  } else {
    endCombo(game);
    game.io.sfx('voiceHero', false, { x: hit.target.x });
  }
}

function landHit(game, hit, damage, direction) {
  const { move } = hit;
  const lastMultiHit = isLastOfMultiHit(hit);
  const knockdown = move.knockdown && lastMultiHit;
  chargeMeters(game, hit, damage);
  freezeOnHit(hit, damage);
  const color = showImpact(game, hit, { direction, hitstop: move.hitstop });
  burstMaterial(game, hit, direction);
  const big = isBigHit(move, knockdown);
  if (big) {
    showBigHit(game, hit, { direction, hitstop: move.hitstop, color });
  } else {
    game.camera.kickX += direction * 0.5;
  }
  showDamageNumber(game, hit, { direction, damage });
  feelHit(game, hit, { direction, big });
  playHitSound(game, hit, move.hitstop);
  scoreHit(game, hit, damage);
  const knockback = (lastMultiHit && move.finalKnockback) || move.knockback;
  return { big, knockdown, knockback };
}

// hit = { attacker, target, move, x, y }; returns whether the hit connected (blocks count)
export function applyHit(game, hit) {
  const { target, move } = hit;
  if (!canBeHit(target, move)) {
    return false;
  }
  if (blocksHit(hit.attacker, target, move)) {
    blockHit(game, hit);
    return true;
  }
  announceGuardBreak(game, hit);
  const direction = hitDirection(hit);
  const damage = damageOf(game, target, move);
  const { big, knockdown, knockback } = landHit(game, hit, damage, direction);
  if (target.hp <= 0) {
    target.hp = 0;
    knockOut(game, target, direction);
    return true;
  }
  if (target.side === 'enemy') {
    shout(game, target, big ? 'big' : 'hurt');
  }
  if (absorbsHit(target, move, damage)) {
    target.armorFlash = 6;
    target.flashTime = 0;
    game.io.sfx('armor', false, { x: target.x });
    return true;
  }
  reactToHit(game, target, { move, direction, knockback, knockdown });
  return true;
}
