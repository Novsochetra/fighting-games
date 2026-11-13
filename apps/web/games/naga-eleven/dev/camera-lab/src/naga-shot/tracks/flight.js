import { NAGA_TIMINGS, movingTicks } from '../sequence.js';
import { BALL_REST, CONTACTS } from '../world.js';
import { bezier, easeOutSoft, lerp } from './ease.js';

// the ball rears up over the field as a serpent strikes, then comes down on the goal
const RISE = { x: 340, y: 96 };

// how far along the flight the ball is as each stage ends: the kick sends it off, the flight
// carries it most of the way, and the keeper's stage plays the last stretch slowed right down
const REACHED = { impact: 0.08, flight: 0.8, keeper: 1 };

export const LIFT = 7;

export const launchPoint = () => ({ x: BALL_REST.x + 2, y: BALL_REST.y - LIFT });

export function flightPoint(ending, share) {
  return bezier(launchPoint(), RISE, CONTACTS[ending], share);
}

function impactShare(clock) {
  const moving = movingTicks(clock.ticks, { at: NAGA_TIMINGS.contact, hold: clock.holds.hit });
  const after = clock.length - NAGA_TIMINGS.contact - clock.holds.hit;

  return moving <= NAGA_TIMINGS.contact
    ? 0
    : (REACHED.impact * (moving - NAGA_TIMINGS.contact)) / Math.max(1, after);
}

const STAGE_SHARE = {
  impact: impactShare,
  flight: (clock) => lerp(REACHED.impact, REACHED.flight, clock.share),
  keeper: (clock) => lerp(REACHED.flight, REACHED.keeper, easeOutSoft(clock.share)),
  collision: () => 1,
  aftermath: () => 1,
};

// 0 at the boot to 1 at the contact; null before the kick
export function flightShare(clock) {
  return STAGE_SHARE[clock.stage]?.(clock) ?? null;
}

export function trailPoint(ending, share, back) {
  return flightPoint(ending, Math.max(0, share - back));
}
