import { bladeTipOf, chestOf } from './default-kit.js';
import { ANGKOR_PARTICLE_MOVERS } from './angkor-particles.js';
import {
  kickChips,
  liftGrit,
  openBloom,
  pourSand,
  scatterPetals,
  shedPetal,
  swirlPetal,
} from './angkor-spawn.js';
import { raiseShafts, SEAL } from './angkor-seal.js';

const SWIRL_STOPS = 2;
// a move that keeps cutting a long while (a dive) pours sand more sparingly past its first cuts
const FULL_TRAIL_TICKS = 12;

function frontFootOf(fighter) {
  return { x: fighter.x + fighter.facing * 7, y: fighter.y };
}

// he sets his feet: a few chips scuff up from behind his back heel
function windup(game, fighter) {
  if (!fighter.airborne) {
    kickChips(game, {
      x: fighter.x - fighter.facing * 5,
      y: fighter.y,
      count: 3,
      direction: -fighter.facing,
      speed: 1,
    });
  }
}

// grit lifts off the rim of the seal as it opens round his feet while lotus light turns in to his chest
function gather(game, fighter, move, time) {
  if (!fighter.airborne) {
    const spread = SEAL.rx * Math.max(0.75, Math.min(1, (time + 1) / move.startup));
    liftGrit(game, { x: fighter.x, y: fighter.y, spread });
  }
  // the last petals arrive before the strike: in a low cut his head comes down where his chest was
  if (time % 2 === 1 && time < move.startup - SWIRL_STOPS) {
    swirlPetal(game, { ...chestOf(fighter), facing: fighter.facing });
  }
}

// he plants his front foot: pillars of light spring up out of the seal, stone chips fly and the
// gathered petals burst forward off him
function release(game, fighter) {
  const { facing } = fighter;
  if (!fighter.airborne) {
    raiseShafts(game, { x: fighter.x, y: fighter.y });
    kickChips(game, { ...frontFootOf(fighter), count: 4, direction: 0 });
  }
  const chest = chestOf(fighter);
  scatterPetals(game, { x: chest.x + facing * 12, y: chest.y + 4, count: 5, direction: facing });
}

// sand pours off the blade along the cut, a petal now and then shed behind it
function trail(game, fighter, move, time) {
  const into = time - move.startup;
  if (into >= FULL_TRAIL_TICKS && time % 3 !== 0) {
    return;
  }
  const tip = bladeTipOf(fighter);
  pourSand(game, { ...tip, direction: -fighter.facing });
  if (into % 3 === 1) {
    shedPetal(game, { ...tip, direction: -fighter.facing });
  }
}

// a lotus opens where the blow lands and the sandstone of it chips off away from him
function impact(game, hit) {
  const small = Boolean(hit.move.multiHit);
  const direction = hit.target.x >= hit.attacker.x ? 1 : -1;
  openBloom(game, { x: hit.x, y: hit.y, small });
  kickChips(game, { x: hit.x, y: hit.y, count: small ? 2 : 3, direction, speed: 2.2 });
}

export const ANGKOR_HEAVY_KIT = {
  sounds: { charge: 'heavyAngkorCharge', release: 'heavyAngkorRelease' },
  windup,
  gather,
  release,
  trail,
  impact,
  particles: ANGKOR_PARTICLE_MOVERS,
};
