import { NAGA_TIMINGS } from '../../sequence.js';
import { afterTicks } from '../../tracks/after.js';
import { easeIn, phaseOf } from '../../tracks/ease.js';

const CHARGED_BEFORE_KICK = ['manifest'];

export function powerOf(clock) {
  if (clock.stage === 'charge') {
    return easeIn(phaseOf(clock.share, 0.06, 0.84));
  }

  if (clock.stage === 'impact') {
    return clock.ticks < NAGA_TIMINGS.contact ? 1 : 0;
  }

  return CHARGED_BEFORE_KICK.includes(clock.stage) ? 1 : 0;
}

// counted through the hold, as the flash and the burst play on while the world stands still
export const sinceHit = (clock) => clock.ticks - NAGA_TIMINGS.contact;

export const movedSinceHit = (clock) => clock.ticks - NAGA_TIMINGS.contact - clock.holds.hit;

const SINCE_CRASH = {
  collision: (clock) => clock.ticks,
  aftermath: (clock) => clock.lengths.collision + clock.ticks,
};

export const sinceCrash = (clock) => SINCE_CRASH[clock.stage]?.(clock) ?? -1;

export const movedSinceCrash = (clock) => afterTicks(clock);

export const pourOf = (clock) =>
  clock.stage === 'impact' ? phaseOf(clock.ticks, 0, NAGA_TIMINGS.contact) : 0;
