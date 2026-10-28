import { HAMMER } from '../../data/hammers.js';

const PHASES = ['rest', 'warn', 'drop', 'down', 'rise'];

export const HAMMER_BEAT = PHASES.reduce((total, phase) => total + HAMMER[phase], 0);

// where in its beat a hammer is: the phase, and how many ticks into it
export function hammerPhase(time) {
  let at = time % HAMMER_BEAT;
  for (const phase of PHASES) {
    if (at < HAMMER[phase]) {
      return { phase, at };
    }
    at -= HAMMER[phase];
  }

  return { phase: 'rest', at: 0 };
}

// how high the head hangs over the floor: it drops all at once and climbs back slowly
export function headLift(time) {
  const { phase, at } = hammerPhase(time);
  if (phase === 'drop') {
    return HAMMER.lift * (1 - (at + 1) / HAMMER.drop);
  }
  if (phase === 'rise') {
    return (HAMMER.lift * (at + 1)) / HAMMER.rise;
  }

  return phase === 'down' ? 0 : HAMMER.lift;
}
