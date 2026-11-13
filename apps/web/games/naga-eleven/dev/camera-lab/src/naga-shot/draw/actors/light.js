import { NAGA_TIMINGS } from '../../sequence.js';
import { phaseOf } from '../../tracks/ease.js';
import { RIM_LEVELS } from './rim.js';

// a step toward the light, in screen pixels
const FROM_BALL = { dx: 1, dy: 0 };

const FROM_BEHIND = { dx: -1, dy: -1 };

const FROM_FLIGHT = { dx: -1, dy: -1 };

const level = (share) => Math.max(0, Math.min(RIM_LEVELS, Math.round(share * RIM_LEVELS)));

function afterKick(clock) {
  const { contact } = NAGA_TIMINGS;
  const since = clock.ticks - contact - clock.holds.hit;

  if (clock.ticks < contact) {
    return { light: FROM_BALL, level: RIM_LEVELS };
  }

  return { light: FROM_BALL, level: level(1 - phaseOf(since, 2, 22)) };
}

const STRIKER = {
  charge: ({ clock }) => ({
    light: FROM_BALL,
    level: level(phaseOf(clock.share, 0.15, 0.8) * 0.75),
  }),
  manifest: ({ naga }) => ({ light: FROM_BEHIND, level: level(0.5 + naga.colour * 0.5) }),
  impact: ({ clock }) => afterKick(clock),
};

export const strikerRim = (moment) => STRIKER[moment.clock.stage]?.(moment) ?? null;

export const keeperRim = ({ keeper }) => ({ light: FROM_FLIGHT, level: level(keeper.lit) });
