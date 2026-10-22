import { clamp } from '../../lib/math.js';
import { arenaBounds } from '../fighters/arena-bounds.js';
import { fireMirageBolt } from '../hazards/mirage-bolts.js';
import { groundAt } from '../stage/terrain.js';
import { FIRE_EVERY, isLive, popMirage } from './mirage.js';

const MIRAGE_LIFE = 600;
// a copy that fires thrusts its staff for this long, the bolt leaving its orb at FIRE_AT
const CAST_TICKS = 24;
const FIRE_AT = 16;
export const POP_TICKS = 18;

function castBolt(game, boss, mirage) {
  mirage.cast++;
  if (mirage.cast === FIRE_AT) {
    fireMirageBolt(game, { boss, from: mirage });
  }
  if (mirage.cast >= CAST_TICKS) {
    mirage.cast = -1;
    mirage.fireIn = FIRE_EVERY;
  }
}

function runMirage(game, boss, mirage, shift) {
  const { min, max } = arenaBounds(game, boss);
  mirage.x = clamp(mirage.x + shift, min, max);
  mirage.y = groundAt(game.terrain, mirage.x);
  mirage.facing = game.player.x >= mirage.x ? 1 : -1;
  mirage.time++;
  if (mirage.cast >= 0) {
    castBolt(game, boss, mirage);
  } else if (mirage.fireIn > 0 && --mirage.fireIn === 0) {
    mirage.cast = 0;
  }
  if (mirage.time >= MIRAGE_LIFE) {
    popMirage(game, mirage);
  }
}

// his copies move as he moves and fade when he falls or calls on the sun
function runMirages(game, boss) {
  const shift = boss.x - (boss.mirageAnchor ?? boss.x);
  boss.mirageAnchor = boss.x;
  const fading = boss.state === 'ko' || Boolean(boss.move?.bossUltimate);
  for (const mirage of boss.mirages) {
    if (!isLive(mirage)) {
      mirage.popTime++;
    } else if (fading) {
      popMirage(game, mirage);
    } else {
      runMirage(game, boss, mirage, shift);
    }
  }
  boss.mirages = boss.mirages.filter((mirage) => mirage.popTime < POP_TICKS);
}

export function updateMirages(game) {
  for (const fighter of game.fighters) {
    if (fighter.mirages?.length) {
      runMirages(game, fighter);
    }
  }
}
