import { hash } from '../../../../../../src/render/duel/hash.js';
import { NAGA_TIMINGS } from '../../sequence.js';
import { afterTicks } from '../../tracks/after.js';
import { easeIn, phaseOf } from '../../tracks/ease.js';
import { MANIFEST } from '../../tracks/naga.js';
import { CONTACTS } from '../../world.js';

export const DARKEST = 4;

const { contact } = NAGA_TIMINGS;

// the lights stutter before each step down, as if the Naga drew the power out of them
function stuttering(dark, frame) {
  const step = Math.floor(dark);
  const stutter = dark - step > 0.7 && hash(frame >> 1, 17) < 0.5;

  return Math.min(DARKEST, step + (stutter ? 1 : 0));
}

const DUSK = {
  charge: (clock) => stuttering(easeIn(phaseOf(clock.share, 0.1, 0.9)) * 3, clock.frame),
  manifest: (clock) => stuttering(3 + phaseOf(clock.share, 0, 0.12), clock.frame),
  impact: (clock) => (clock.ticks < contact ? DARKEST : 0),
};

// in whole steps, as a palette swaps
export const duskOf = (clock) => DUSK[clock.stage]?.(clock) ?? 0;

const NONE = { level: 0 };

function chargePool({ clock, ball }) {
  const level = Math.round(phaseOf(clock.share, 0.2, 0.6) * 2);

  return level ? { level, x: ball.x, radius: 18 + 16 * clock.share } : NONE;
}

function manifestPool({ naga }) {
  const fresh = naga.pulse >= 0 && naga.pulse < 14;
  const level = Math.min(4, 2 + Math.round(naga.colour * 1.4) + (fresh ? 1 : 0));

  return { level, x: MANIFEST.x + 10, radius: 60 + naga.colour * 30 + (fresh ? 14 : 0) };
}

function impactPool({ clock, ball }) {
  const pour = phaseOf(clock.ticks, 0, contact);

  return pour >= 1 ? NONE : { level: 3, x: ball.x - 10 * (1 - pour), radius: 60 * (1 - pour) + 14 };
}

// after the kick the light rides under the ball and gathers on the keeper as he lights up
function ridingPool({ ball, keeper, ending }) {
  const level = Math.round(keeper.lit * 3.4);
  const x = keeper.lit >= 1 ? CONTACTS[ending].x : ball.x;

  return level ? { level, x, radius: 26 + keeper.lit * 34 } : NONE;
}

const POOL = {
  charge: chargePool,
  manifest: manifestPool,
  impact: impactPool,
  flight: ridingPool,
  keeper: ridingPool,
  collision: ridingPool,
};

export const poolOf = (moment) => POOL[moment.clock.stage]?.(moment) ?? NONE;

const BURSTS = {
  impact: (clock) => (clock.ticks >= contact && clock.ticks < contact + 26 ? 12 : 0),
  collision: () => 16,
  manifest: (clock) => (clock.share > 0.72 && clock.share < 0.86 ? 5 : 0),
};

// cameras firing a frame, on average
export function flashesOf({ clock, ending }) {
  const burst = BURSTS[clock.stage]?.(clock) ?? 0;

  if (clock.stage === 'aftermath') {
    return ending === 'goal' ? 10 * (1 - clock.share) + 1 : 0.3;
  }

  return burst || (clock.stage === 'awakening' || clock.stage === 'flight' ? 0.15 : 0);
}

// 0 seated, 1 on their feet: the stand rises at the crash and dances on a goal
export function cheerOf({ clock, ending }) {
  if (clock.stage === 'aftermath' && ending === 'goal') {
    return Math.floor(clock.ticks / 7) % 2;
  }

  return clock.stage === 'collision' && afterTicks(clock) > 2 ? 1 : 0;
}
