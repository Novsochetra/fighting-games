import { BOKATOR_HEAVY_ART as ART } from '../../../art/heavy-fx/bokator.js';
import { addRing } from '../effects.js';
import {
  breakGround,
  chestFlare,
  coilFlame,
  FLAME_HOLD,
  flameTick,
  liftColumn,
  spendFlame,
  strikeStar,
} from './bokator-bursts.js';
import {
  BOKATOR_PARTICLE_MOVERS,
  breathIn,
  kickDust,
  rakeClaw,
  roarWaves,
  shedLeaf,
} from './bokator-particles.js';
import { bladeTipOf, chestOf, shedMotes } from './default-kit.js';

// he plants before he strikes: bronze dust puffs off his feet as they grip the ground
function windup(game, fighter) {
  if (fighter.airborne) {
    return;
  }
  const feet = { x: fighter.x, y: fighter.y };
  kickDust(game, { ...feet, direction: -fighter.facing, count: 2, speed: 1.2 });
  kickDust(game, { ...feet, direction: fighter.facing, count: 1, speed: 0.8 });
}

// golden breath drawn in, coiling round his chest, and the gold flame rising behind him; a flame
// left hanging in the air would not follow him, so it only burns on the ground
function gather(game, fighter, move, time) {
  if (time % 2 === 0) {
    breathIn(game, chestOf(fighter), { count: 2, spin: 0.13 * fighter.facing });
  }
  if (time === flameTick(move) && !fighter.airborne) {
    coilFlame(game, fighter, move);
  }
}

// the breath let out as a roar: a ring and two roar waves from the chest, gold leaf torn off his
// back shoulder, dust driven back off the foot he pushes from and, fully charged, the road cracking;
// in the air his chest flares instead
function release(game, fighter, move) {
  const chest = chestOf(fighter);
  addRing(game, { ...chest, color: ART.glow });
  roarWaves(game, chest, fighter.facing);
  const shoulder = { x: fighter.x - fighter.facing * 6, y: fighter.y - 30 };
  shedLeaf(game, shoulder, { count: 2, lift: 0.5, direction: fighter.facing * 2 });
  if (fighter.airborne) {
    chestFlare(game, fighter, chest);
    return;
  }
  const back = { x: fighter.x - fighter.facing * 4, y: fighter.y };
  kickDust(game, { ...back, direction: -fighter.facing, count: 3, speed: 2 });
  if (move.chargeLevel === 2) {
    breakGround(game, fighter);
  }
}

// gold shed where the fist or foot passes, motes drifting back and leaf fluttering down; a strike
// that lands nothing spends the flame behind him all the same
function trail(game, fighter, move, time) {
  if (time === move.startup + FLAME_HOLD) {
    spendFlame(game, fighter);
  }
  if (time % 2 === 0) {
    const tip = bladeTipOf(fighter);
    shedMotes(game, tip, { colors: ART.motes, direction: -fighter.facing, count: 1, life: 12 });
    shedLeaf(game, tip, { count: 1, lift: 0.4, direction: -fighter.facing });
  }
}

// the flame behind him spent into the blow, a gold fist-star and a lion's rake across it; a spin
// that lands five times rakes shorter and sheds less, so its rakes do not pile up
function impact(game, hit) {
  const direction = hit.attacker.facing;
  const single = !hit.move.multiHit;
  spendFlame(game, hit.attacker);
  strikeStar(game, hit);
  liftColumn(game, hit);
  rakeClaw(game, { x: hit.x + direction * 3, y: hit.y, direction, life: single ? 16 : 9 });
  shedLeaf(game, hit, { count: single ? 3 : 1, lift: 1.2, direction });
}

export const BOKATOR_HEAVY_KIT = {
  sounds: { charge: 'heavyBokatorCharge', release: 'heavyBokatorRelease' },
  windup,
  gather,
  release,
  trail,
  impact,
  particles: BOKATOR_PARTICLE_MOVERS,
};
