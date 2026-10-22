import { FX_COLORS } from '../../art/fx-colors.js';
import { randomBetween } from '../../lib/math.js';
import { shake } from '../fx/camera-fx.js';
import { addDust } from '../fx/particles.js';
import { groundAt } from '../stage/terrain.js';
import { strikeArea } from './strike.js';

// a relief soldier's life in ticks: it steps out of the stone, thrusts, holds the lunge, crumbles
export const SOLDIER_TIMING = { rise: 8, strike: 14, crumble: 26, end: 36 };
const STRIKE_TICKS = 3;
const REACH = 40;
const COMBO_SOLDIER = {
  damage: 7,
  knockback: [2.8, -2.6],
  knockdown: true,
  hitstop: 6,
  hitstun: 22,
};

// a soldier carved on the Bayon's walls stepping out of the ground ahead of the hero in his own
// shape, and thrusting once
export function raiseSoldier(game, { x, direction, hit, delay = 0 }) {
  game.summons.push({
    kind: 'soldier',
    hero: game.settings.hero,
    x,
    y: groundAt(game.terrain, x),
    direction,
    side: 'player',
    time: -delay,
    hit,
    hitTargets: new Set(),
  });
}

function thrustArea(soldier) {
  const x = soldier.direction > 0 ? soldier.x : soldier.x - REACH;
  return { x, y: soldier.y - 36, width: REACH, height: 30 };
}

// a carving breaking up: sandstone chunks and dust falling off where it stands
export function crumbleStone(game, { x, y }) {
  addDust(game, { x, y, count: 4, color: FX_COLORS.reliefStone });
  for (let i = 0; i < 6; i++) {
    game.particles.push({
      kind: 'chunk',
      x: x + randomBetween(-8, 8),
      y: y - randomBetween(4, 34),
      vx: randomBetween(-1, 1),
      vy: -randomBetween(0.4, 1.8),
      life: randomBetween(18, 28) | 0,
      maxLife: 28,
      color: i % 2 ? FX_COLORS.reliefStone : FX_COLORS.reliefShade,
    });
  }
}

function thrust(game, soldier) {
  for (const target of strikeArea(game, soldier, thrustArea(soldier))) {
    addDust(game, { x: target.x, y: soldier.y, count: 2, color: FX_COLORS.reliefStone });
    shake(game, 1, 4);
  }
}

export function updateSoldier(game, soldier) {
  const { strike, crumble, end } = SOLDIER_TIMING;
  if (soldier.time === 1) {
    addDust(game, { x: soldier.x, y: soldier.y, count: 3, color: FX_COLORS.reliefStone });
  }
  if (soldier.time >= strike && soldier.time < strike + STRIKE_TICKS) {
    thrust(game, soldier);
  }
  if (soldier.time === crumble) {
    crumbleStone(game, soldier);
  }
  soldier.done = soldier.time >= end;
}

// a finisher calls carved soldiers out of the ground ahead, one rank after another, each thrusting
export function raiseComboSoldiers(game, fighter, count) {
  for (let i = 0; i < count; i++) {
    raiseSoldier(game, {
      x: fighter.x + fighter.facing * (18 + i * 26),
      direction: fighter.facing,
      hit: COMBO_SOLDIER,
      delay: i * 5,
    });
  }
  game.io.sfx('relief', false, { x: fighter.x });
}
