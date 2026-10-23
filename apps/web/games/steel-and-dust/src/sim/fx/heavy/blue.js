import { BLUE_HEAVY_ART } from '../../../art/heavy-fx/blue.js';
import { BLUE_HEAVY_FEEL } from '../../../data/heavy-feel/blue.js';
import { fxBetween, fxRandom } from '../fx-random.js';
import {
  BLUE_PARTICLE_MOVERS,
  cutAt,
  drawInMist,
  flashAt,
  formCrystal,
  pushMist,
  shedFlake,
  throwShards,
} from './blue-particles.js';
import { strikeLineOf } from './blue-strike.js';
import { bladeTipOf, chestOf } from './default-kit.js';

const art = BLUE_HEAVY_ART;
// the cut a blow leaves leans one way or the other, never flat, so it reads as a slash
const CUT_LEAN = [0.35, 0.8];

// the angle that heads one way along the ground, tipped `lift` radians up into the air
function headingOf(direction, lift) {
  return direction > 0 ? -lift : Math.PI + lift;
}

// cold air pools in along the ground toward the stance as the heavy begins
function windup(game, fighter) {
  if (fighter.airborne) {
    return;
  }
  for (const side of [-1, 1]) {
    const at = { x: fighter.x + side * 16, y: fighter.y - 1 };
    pushMist(game, at, { vx: -side * 1.1, life: 12, color: art.mist });
  }
}

// somewhere on the coiled body below the face, where the drawn sprite stands as it leans back
function bodyPointOf(game, fighter) {
  const back = BLUE_HEAVY_FEEL.lean + fxBetween(game, -2, 6);
  return { x: fighter.x - fighter.facing * back, y: fighter.y - fxBetween(game, 6, 26) };
}

// mist streams into the chest and frost crystallises on the body, all of it breaking as it strikes
function gather(game, fighter, move, time) {
  if (time < move.startup - 1) {
    drawInMist(game, chestOf(fighter), {
      radius: fxBetween(game, 14, 22),
      life: 8,
      color: art.mist,
    });
  }
  if (time % 3 === 1 && time < move.startup - 1) {
    formCrystal(game, bodyPointOf(game, fighter), move.startup - time + 1);
  }
}

// the crystals round the stance (render/fx/heavy/blue-ground.js) break and leap up as it dashes,
// and the cold air it leaves rolls out behind
function kickUpFrost(game, fighter) {
  const stanceX = fighter.x - fighter.facing * BLUE_HEAVY_FEEL.lean;
  for (const side of [-1, 1]) {
    const at = { x: stanceX + side * 9, y: fighter.y - 3 };
    throwShards(game, at, { count: 2, angle: headingOf(side, 1.15), spread: 0.3, speed: 2.4 });
  }
  const back = { x: fighter.x - fighter.facing * 6, y: fighter.y - 2 };
  pushMist(game, back, { vx: -fighter.facing * 1.6, life: 14, color: art.mist });
}

// one cold flash where the draw's cut opens (render/fx/heavy/blue-layers.js draws the cut), the
// frost on the body shattering on along it
function release(game, fighter, move) {
  const { from, to } = strikeLineOf(fighter, move);
  flashAt(game, from, 5);
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  throwShards(game, from, {
    count: 5,
    angle: angle - fighter.facing * 0.25,
    spread: 0.4,
    speed: 3.4,
  });
  if (!fighter.airborne) {
    kickUpFrost(game, fighter);
  }
}

function trail(game, fighter, _move, time) {
  if (time % 2 === 0) {
    shedFlake(game, bladeTipOf(fighter), -fighter.facing);
  }
}

// a blow leaves a thin cold cut through the raider and throws ice on past it; the many blows of a
// spin throw less, so the ice the freeze leaves still reads
function impact(game, hit) {
  const lean = fxBetween(game, CUT_LEAN[0], CUT_LEAN[1]) * (fxRandom(game) < 0.5 ? -1 : 1);
  cutAt(game, hit, lean);
  const count = hit.move.multiHit ? 2 : 4;
  const angle = headingOf(hit.attacker.facing, 0.3);
  throwShards(game, hit, { count, angle, spread: 0.6, speed: 3 });
}

export const BLUE_HEAVY_KIT = {
  sounds: { charge: 'heavyBlueCharge', release: 'heavyBlueRelease' },
  windup,
  gather,
  release,
  trail,
  impact,
  particles: BLUE_PARTICLE_MOVERS,
};
