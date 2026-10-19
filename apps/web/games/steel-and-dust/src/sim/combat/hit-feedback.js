import { COLORS } from '../../art/colors.js';
import { WEAPONS } from '../../data/weapons/index.js';
import { randomBetween } from '../../lib/math.js';
import { isPlayer } from '../fighters/loadout.js';
import { punch, shake } from '../fx/camera-fx.js';
import { addImpact, addRing, addSpeedLines } from '../fx/effects.js';
import { buzz } from '../fx/haptics.js';
import { addSparks } from '../fx/particles.js';

function shakeAmount(hitstop) {
  if (hitstop >= 9) {
    return 3;
  }
  return hitstop >= 7 ? 2 : 1;
}

function damageNumberColor(attacker, damage) {
  if (!isPlayer(attacker)) {
    return COLORS.scarlet;
  }
  if (damage >= 14) {
    return COLORS.tangerine;
  }
  return damage >= 9 ? COLORS.butter : COLORS.white;
}

export function attackerWeapon(attacker) {
  return isPlayer(attacker) ? WEAPONS[attacker.weapon.id] : null;
}

export function showImpact(game, hit, { direction, hitstop }) {
  const weapon = attackerWeapon(hit.attacker);
  const color = weapon ? weapon.sparkColor : COLORS.gold;
  const heavy = hitstop >= 9;
  shake(game, shakeAmount(hitstop), hitstop + 2);
  addImpact(game, {
    x: hit.x,
    y: hit.y,
    big: heavy,
    color,
    bladed: !!(weapon && weapon.bladed),
    direction,
  });
  addSparks(game, { x: hit.x, y: hit.y, count: heavy ? 10 : 6, color, speed: heavy ? 3.2 : 2.4 });
  return color;
}

export function showBigHit(game, hit, { direction, hitstop, color }) {
  const huge = hitstop >= 11;
  addRing(game, { x: hit.x, y: hit.y, color });
  if (huge || hit.move.launch) {
    addSpeedLines(game, hit.x, hit.y);
  }
  punch(game, {
    x: hit.x - game.camera.x,
    y: hit.y,
    time: huge ? 10 : 7,
    kickX: direction * (huge ? 2 : 1.2),
    kickY: 0,
  });
}

export function showDamageNumber(game, hit, { direction, damage }) {
  if (!game.settings.numbers) {
    return;
  }
  const playerHit = isPlayer(hit.attacker);
  game.floaters.push({
    x: hit.x + randomBetween(-3, 3),
    y: hit.y - 6,
    text: String(damage),
    color: damageNumberColor(hit.attacker, damage),
    time: 0,
    size: playerHit && damage >= 14 ? 2 : 1,
    vx: direction * 0.25,
  });
}

export function feelHit(game, hit, { direction, big }) {
  if (isPlayer(hit.attacker)) {
    buzz(game, big ? 18 : 7);
  }
  if (isPlayer(hit.target)) {
    game.hurtFlash = 14;
    buzz(game, 40);
    punch(game, {
      x: hit.target.x - game.camera.x,
      y: hit.target.y - 18,
      time: 6,
      kickX: -direction * 1.5,
      kickY: 0,
    });
  }
}
