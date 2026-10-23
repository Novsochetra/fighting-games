import { MOSS_HEAVY_ART as ART } from '../../../art/heavy-fx/moss.js';
import { fxBetween } from '../fx-random.js';
import { bladeTipOf, fxSparks } from './default-kit.js';
import { mossImpact } from './moss-impact.js';
import { MOSS_PARTICLE_MOVERS } from './moss-movers.js';
import { addLeaf, addPulledLeaf, addSpore, throwSpray } from './moss-spawn.js';
import { MOSS_SWINGS, mossCoreOf, mossSwingOf } from './moss-swing.js';

// a long heavy (a dive) stops shedding after this many ticks, so it keeps to its share of particles
const TRAIL_TICKS = 24;

// the grove wakes under the Shade's feet: spores lift off the ground and a leaf or two is stirred up
function windup(game, fighter) {
  const ground = { x: fighter.x, y: fighter.y };
  for (let i = 0; i < 3; i++) {
    const x = ground.x + fxBetween(game, -9, 9);
    addSpore(game, { x, y: ground.y - 1, vy: -fxBetween(game, 0.5, 0.9), life: 24 });
  }
  if (!fighter.airborne) {
    throwSpray(game, addLeaf, {
      at: ground,
      facing: 1,
      angle: -Math.PI / 2,
      spread: 1,
      speed: 1.6,
      count: 2,
      life: 26,
    });
  }
}

// leaves are drawn in to the core, all arriving as it strikes, while spores rise off the ground
// (the swirl round the core is drawn, render/fx/heavy/moss-swirl.js)
function gather(game, fighter, move, time) {
  const ticks = move.startup - time;
  if (time % 3 === 0 && ticks >= 3) {
    addPulledLeaf(game, { at: mossCoreOf(fighter), ticks });
  }
  if (time % 2 === 1) {
    const x = fighter.x + fxBetween(game, -12, 12);
    addSpore(game, { x, y: fighter.y - 1, vy: -fxBetween(game, 0.6, 1.1), life: 20 });
  }
}

// the power leaves as a gust of leaves and spores thrown along the swing, with a few hot sparks (its
// ring bursts along the ground and its crescent sweeps the arc, render/fx/heavy/moss-swing.js)
function release(game, fighter, move) {
  const swing = MOSS_SWINGS[mossSwingOf(move)];
  const core = mossCoreOf(fighter);
  const at = { x: core.x + fighter.facing * 6, y: core.y - 2 };
  const spray = { at, facing: fighter.facing, ...swing };
  throwSpray(game, addLeaf, { ...spray, speed: 3.8, life: 30 });
  const spores = { spread: swing.spread + 0.4, speed: 2.6, count: swing.count - 2, life: 22 };
  throwSpray(game, addSpore, { ...spray, ...spores });
  fxSparks(game, { ...at, count: 4, color: ART.hot, speed: 2.8 });
}

// leaves and spores torn off the swing drift away behind it
function trail(game, fighter, move, time) {
  const since = time - move.startup;
  if (since % 2 !== 0 || since >= TRAIL_TICKS) {
    return;
  }
  const tip = bladeTipOf(fighter);
  const back = -fighter.facing;
  addLeaf(game, { ...tip, vx: back * fxBetween(game, 0.4, 1.1), vy: -fxBetween(game, 0.2, 0.8) });
  addSpore(game, { ...tip, vx: back * fxBetween(game, 0.2, 0.6), vy: -0.4, life: 16 });
}

export const MOSS_HEAVY_KIT = {
  sounds: { charge: 'heavyMossCharge', release: 'heavyMossRelease' },
  windup,
  gather,
  release,
  trail,
  impact: mossImpact,
  particles: MOSS_PARTICLE_MOVERS,
};
