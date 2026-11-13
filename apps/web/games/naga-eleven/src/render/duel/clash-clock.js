import { IMPACT_TICK, STAGE_TICKS } from './stages.js';

export function clashClock(show) {
  if (show.stage !== 'clash') {
    return STAGE_TICKS.clash + show.stageTicks;
  }

  const past = show.stageTicks - IMPACT_TICK;

  return past <= 0 ? show.stageTicks : IMPACT_TICK + Math.max(0, past - show.freeze);
}

export const clashLength = (show) => STAGE_TICKS.clash + show.freeze;
