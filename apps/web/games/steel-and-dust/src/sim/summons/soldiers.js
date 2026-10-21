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

// when it strikes: a finisher's soldier thrusts once; an ultimate's soldier waits in the ground until
// its rank's wave reaches it, then fights a chain of moves, striking in step with the rank on its
// `beats`, and crumbles a while after its last
export function soldierTiming(soldier) {
  const { rise, strike, crumble: crumbleAt, end } = SOLDIER_TIMING;
  const beats = soldier.beats || [strike];
  const lastBeat = beats[beats.length - 1];
  return {
    wait: soldier.wait || 0,
    rise,
    beats,
    strike: beats[0],
    crumble: lastBeat + crumbleAt - strike,
    end: lastBeat + end - strike,
  };
}

// a soldier carved on the Bayon's walls stepping out of the ground in the hero's own shape; with no
// hit it only plays, for an ultimate that strikes every raider itself
export function raiseSoldier(game, soldier) {
  const {
    x,
    direction,
    hit = null,
    delay = 0,
    wait = 0,
    moves = ['thrust'],
    beats = null,
  } = soldier;
  game.summons.push({
    kind: 'soldier',
    hero: game.settings.hero,
    x,
    y: groundAt(game.terrain, x),
    direction,
    side: 'player',
    time: -delay,
    wait,
    moves,
    beats,
    hit,
    hitTargets: new Set(),
  });
}

function thrustArea(soldier) {
  const x = soldier.direction > 0 ? soldier.x : soldier.x - REACH;
  return { x, y: soldier.y - 36, width: REACH, height: 30 };
}

function crumble(game, soldier) {
  addDust(game, { x: soldier.x, y: soldier.y, count: 4, color: FX_COLORS.reliefStone });
  for (let i = 0; i < 6; i++) {
    game.particles.push({
      kind: 'chunk',
      x: soldier.x + randomBetween(-8, 8),
      y: soldier.y - randomBetween(4, 34),
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
  const { wait, strike, crumble: crumbleAt, end } = soldierTiming(soldier);
  if (soldier.time === wait + 1) {
    addDust(game, { x: soldier.x, y: soldier.y, count: 3, color: FX_COLORS.reliefStone });
  }
  const striking = soldier.time >= strike && soldier.time < strike + STRIKE_TICKS;
  if (soldier.hit && striking) {
    thrust(game, soldier);
  }
  if (soldier.time === crumbleAt) {
    crumble(game, soldier);
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
