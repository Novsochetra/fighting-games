import { COLORS } from '../../art/colors.js';
import { activeEnd } from '../../data/moves/define-move.js';
import { isPlayer } from '../fighters/loadout.js';
import { addFloatText, addRing } from '../fx/effects.js';
import { addSparks } from '../fx/particles.js';
import { reverseDive } from '../hazards/shot-aim.js';
import { isDeflectable } from '../hazards/shot-rules.js';
import { breakCrate } from '../items/crates.js';
import { shatterIceOn } from '../summons/ice.js';
import { applyHit } from './apply-hit.js';
import { attackBox, crateBox, hurtBox, knifeBox, overlapCenter, overlaps } from './boxes.js';
import { addUltMeter } from './combo.js';
import { useDurability } from './durability.js';

const DEFLECT_SPEED = 4.6;

function breakIce(game, attacker, target) {
  if (attacker.move.shatters) {
    shatterIceOn(game, target, attacker.facing);
  }
}

function hitFighters(game, attacker, area) {
  let connected = false;
  for (const target of game.fighters) {
    if (target.side === attacker.side || attacker.hitTargets.has(target)) {
      continue;
    }
    const body = hurtBox(target);
    if (!body || !overlaps(area, body)) {
      continue;
    }
    const center = overlapCenter(area, body);
    if (applyHit(game, { attacker, target, move: attacker.move, ...center })) {
      attacker.hitTargets.add(target);
      connected = true;
      breakIce(game, attacker, target);
    }
  }
  return connected;
}

function hitCrates(game, attacker, area) {
  for (const crate of game.crates) {
    if (!crate.broken && !attacker.hitTargets.has(crate) && overlaps(area, crateBox(crate))) {
      attacker.hitTargets.add(crate);
      breakCrate(game, crate);
    }
  }
}

function deflectKnife(game, attacker, knife) {
  reverseDive(knife, DEFLECT_SPEED);
  Object.assign(knife, {
    side: 'player',
    direction: attacker.facing,
    speed: DEFLECT_SPEED,
    damage: 10,
  });
  knife.color = COLORS.gold;
  knife.time = 0;
  knife.hitTargets.clear();
  attacker.hitstop = Math.max(attacker.hitstop, 5);
  addSparks(game, { x: knife.x, y: knife.y, count: 10, color: COLORS.gold, speed: 2.8 });
  addRing(game, { x: knife.x, y: knife.y, color: COLORS.gold });
  game.io.sfx('armor');
  addFloatText(game, { x: knife.x, y: knife.y - 10, text: 'deflect!', color: COLORS.gold });
  addUltMeter(game, 4);
}

function deflectKnives(game, attacker, area) {
  for (const shot of game.projectiles) {
    if (isDeflectable(shot) && overlaps(area, knifeBox(shot))) {
      deflectKnife(game, attacker, shot);
    }
  }
}

function stopOrBounce(attacker, move, strikeEnd) {
  if (move.dive && move.bounce) {
    Object.assign(attacker, { move: null, hitboxActive: false, state: 'air', vy: -3.8 });
    attacker.vx = -attacker.facing * 0.8;
  } else if (move.haltOnHit && attacker.moveTime < strikeEnd) {
    attacker.moveTime = strikeEnd;
    attacker.hitboxActive = false;
    attacker.vx = attacker.facing * 0.6;
  }
}

// a rising strike lifts the hero with the enemy; a pogo bounces off them, three times a jump
function riseWithHit(attacker, move, strikeEnd) {
  if (move.hop && !attacker.airborne) {
    Object.assign(attacker, { vy: move.hop, airborne: true, hitboxActive: false });
    attacker.moveTime = Math.max(attacker.moveTime, strikeEnd);
  }
  if (move.pogo && attacker.airborne) {
    attacker.moveTime = Math.max(attacker.moveTime, strikeEnd);
    attacker.hitboxActive = false;
    attacker.pogoCount += 1;
    if (attacker.pogoCount <= 3) {
      attacker.vy = -4.4;
    }
  }
}

function followUpOnHit(game, attacker) {
  const move = attacker.move;
  const strikeEnd = activeEnd(move);
  if (!attacker.durabilityUsed) {
    attacker.durabilityUsed = true;
    useDurability(game, attacker);
  }
  stopOrBounce(attacker, move, strikeEnd);
  riseWithHit(attacker, move, strikeEnd);
}

function resolveAttacker(game, attacker) {
  const area = attackBox(attacker, attacker.move.hitbox);
  const connected = hitFighters(game, attacker, area);
  if (!isPlayer(attacker)) {
    return;
  }
  hitCrates(game, attacker, area);
  deflectKnives(game, attacker, area);
  if (connected) {
    followUpOnHit(game, attacker);
  }
}

export function resolveHits(game) {
  for (const attacker of game.fighters) {
    if (attacker.state === 'attack' && attacker.hitboxActive && attacker.move) {
      resolveAttacker(game, attacker);
    }
  }
}
