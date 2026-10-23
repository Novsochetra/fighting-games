import { fxBetween } from '../fx-random.js';
import { bladeTipOf, chestOf } from './default-kit.js';
import { FIREFLY_PARTICLE_MOVERS } from './firefly-movers.js';
import { SWARM_SIZE, swarmCentreAt, swarmKnotOf, swarmOrbit } from './firefly-orbit.js';
import {
  aimFrom,
  spawnBug,
  spawnFlash,
  spawnGlint,
  spawnJoiner,
  strikePointOf,
} from './firefly-swarm.js';

// a dive can stay active for a second; its trail sheds only over the first stretch of it
const TRAIL_TICKS = 16;
const BURST = 8;

// fireflies flying in curve the way the swarm turns and reach it where it will be, so they fall in
// with it
function joinSwarm(game, fighter, { move, time, life }) {
  const to = swarmCentreAt(fighter, move, time + life);
  spawnJoiner(game, to, { radius: 34, life, bend: -fighter.facing * 1.6 });
}

// the gathered swarm bursts out of its knot on along the line of the blow, rising as fireflies do
// rather than piling onto the raider
function burstFromSwarm(game, fighter, move) {
  const chest = chestOf(fighter);
  const strike = strikePointOf(fighter, move);
  const swarm = swarmOrbit(fighter, move, move.startup);
  for (let i = 0; i < BURST; i++) {
    const bug = swarm[(i * 3) % SWARM_SIZE];
    const aim = aimFrom(chest, strike, fxBetween(game, -0.9, 0.9) - fighter.facing * 0.6);
    const speed = fxBetween(game, 2.2, 3.6);
    const life = Math.round(fxBetween(game, 16, 24));
    spawnBug(game, bug, { vx: aim.x * speed, vy: aim.y * speed, life, drag: 0.85, wobble: 0.35 });
  }
}

function shedFromBlade(game, fighter) {
  spawnBug(game, bladeTipOf(fighter), {
    vx: -fighter.facing * fxBetween(game, 0.2, 0.8),
    vy: -fxBetween(game, 0.2, 0.7),
    life: Math.round(fxBetween(game, 14, 20)),
    wobble: 0.4,
  });
}

// stung, the fireflies bounce off the raider and dart up, and the air round the blow crackles
function sting(game, hit, count) {
  for (let i = 0; i < count; i++) {
    spawnBug(game, hit, {
      vx: fxBetween(game, -1.6, 1.6),
      vy: -fxBetween(game, 1.2, 2.4),
      life: Math.round(fxBetween(game, 14, 20)),
      drag: 0.88,
    });
  }
  spawnGlint(game, hit, { spread: 7, life: 9 });
}

// the swarm rallies round the hero as it winds up (the circling swarm is drawn by
// render/fx/heavy/firefly-layers.js), flashes as one at the strike and is flung out with the blow
export const FIREFLY_HEAVY_KIT = {
  sounds: { charge: 'heavyFireflyCharge', release: 'heavyFireflyRelease' },
  windup(game, fighter, move) {
    for (let i = 0; i < 3; i++) {
      joinSwarm(game, fighter, { move, time: 0, life: Math.max(4, move.startup - i) });
    }
  },
  gather(game, fighter, move, time) {
    if (time % 3 === 1 && move.startup - time > 3) {
      joinSwarm(game, fighter, { move, time, life: move.startup - time });
    }
  },
  release(game, fighter, move) {
    spawnFlash(game, swarmKnotOf(fighter, move), { size: 2, facing: fighter.facing });
    burstFromSwarm(game, fighter, move);
  },
  trail(game, fighter, move, time) {
    const since = time - move.startup;
    if (since < TRAIL_TICKS / 2 || (since % 2 === 0 && since < TRAIL_TICKS)) {
      shedFromBlade(game, fighter);
    }
  },
  impact(game, hit) {
    spawnFlash(game, hit, { size: 1, facing: hit.attacker.facing, life: 5 });
    sting(game, hit, hit.move.multiHit ? 1 : 3);
  },
  particles: FIREFLY_PARTICLE_MOVERS,
};
