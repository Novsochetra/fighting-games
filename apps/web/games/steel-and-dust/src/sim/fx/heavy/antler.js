import { ANTLER_HEAVY_ART as ART } from '../../../art/heavy-fx/antler.js';
import { addRing } from '../effects.js';
import { fxBetween } from '../fx-random.js';
import { chargeRush, crownOf, flameBurst, shedAntlers, stamp } from './antler-bursts.js';
import { ANTLER_PARTICLE_MOVERS, addFork, addHoof, addWisp } from './antler-particles.js';
import { bladeTipOf, chestOf, fxSparks, gatherMotes } from './default-kit.js';

// its antlers burst into ghost fire as their swing ends, and the antlers of a blow land past the
// raider, clear of the damage number over it
const SHED_AT = 2;
const FORK_AHEAD = 5;
// a heavy that dives on and on stops shedding fire after a while
const TRAIL_TICKS = 24;

const charges = (move) => Boolean(move.forward || move.sustain);

// ghost fire rising round its feet, or round its body in the air, drawn up into it
function risingFlame(game, fighter) {
  const dx = fxBetween(game, -11, 11);
  const y = fighter.airborne ? fighter.y - fxBetween(game, 4, 16) : fighter.y - 3;
  const vy = -fxBetween(game, 0.5, 0.9);
  const life = Math.round(fxBetween(game, 13, 18));
  addWisp(game, { x: fighter.x + dx, y, vx: -dx * 0.03, vy, life });
}

function shedTrail(game, fighter, move, since) {
  if (since === SHED_AT) {
    shedAntlers(game, fighter, move);
  }
  if (since % 2 === 1) {
    const tip = bladeTipOf(fighter);
    addWisp(game, { ...tip, vx: -fighter.facing * fxBetween(game, 0.3, 0.8), life: 12 });
  }
  if (charges(move) && !fighter.airborne && since % 4 === 3) {
    addHoof(game, { x: fighter.x - fighter.facing * 3, y: fighter.y });
  }
}

export const ANTLER_HEAVY_KIT = {
  sounds: { charge: 'heavyAntlerCharge', release: 'heavyAntlerRelease' },
  windup(game, fighter) {
    if (!fighter.airborne) {
      stamp(game, fighter, -5);
    }
  },
  gather(game, fighter, _move, time) {
    if (time % 2 === 0) {
      risingFlame(game, fighter);
    }
    if (time % 4 === 1) {
      gatherMotes(game, crownOf(fighter), { colors: ART.motes, radius: 16, life: 8, count: 1 });
    }
  },
  release(game, fighter, move) {
    const chest = chestOf(fighter);
    addRing(game, { ...chest, color: ART.glow });
    flameBurst(game, chest);
    chargeRush(game, fighter, move);
    if (!fighter.airborne) {
      stamp(game, fighter, 4);
    }
  },
  trail(game, fighter, move, time) {
    const since = time - move.startup;
    if (since <= TRAIL_TICKS) {
      shedTrail(game, fighter, move, since);
    }
  },
  impact(game, { attacker, move, x, y }) {
    const light = Boolean(move.multiHit);
    addFork(game, { x: x + attacker.facing * FORK_AHEAD, y, facing: attacker.facing });
    fxSparks(game, { x, y, count: light ? 2 : 4, color: ART.hot, speed: 3 });
    for (let i = 0; i < (light ? 1 : 3); i++) {
      const vx = attacker.facing * fxBetween(game, 0.4, 1.4);
      addWisp(game, { x, y: y + fxBetween(game, -4, 4), vx, vy: -fxBetween(game, 0.6, 1.2) });
    }
  },
  particles: ANTLER_PARTICLE_MOVERS,
};
