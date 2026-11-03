import { DRILLS } from '../../../data/training.js';
import { driftActive } from '../../../training/target-shot/motion.js';

const TUNING = DRILLS['target-shot'].tuning;

// the drift is slow, so his feet step quicker than it carries him, as a player shuffles across
const SHUFFLE = 1.6;

// the run carries him sideways only in play: once the last shot is struck he stands
export const isDrifting = (state) => state.phase === 'play' && driftActive(state, TUNING);

const strikeOf = (run, kick) => {
  const age = run.stage === 'flight' ? run.ball.ticks : Infinity;

  return age < kick.ticks ? age + kick.lead : null;
};

// what the shooter does, as one of the match's animations, and the way he faces: at the goal
// while he stands, winds up and strikes (a sheet with no kick drawn facing away strikes
// three-quarters on, as in a match), and three-quarters toward the way the run carries him;
// `kick` is the art's kick timing (kickTimingOf)
export function shooterPose(state, kick) {
  const run = state.run;
  const strike = strikeOf(run, kick);

  if (strike !== null) {
    return { name: 'kick', age: strike, fallback: 'idle', direction: 'north' };
  }

  if (isDrifting(state)) {
    const direction = run.spot.dir > 0 ? 'north-east' : 'north-west';

    return { name: 'run', stride: state.tick * SHUFFLE, loop: true, fallback: 'run', direction };
  }

  if (run.stage === 'aim' && run.charge > 0) {
    return { name: 'kick', age: 0, fallback: 'idle', direction: 'north' };
  }

  return { name: 'idle', age: state.tick, loop: true, fallback: 'idle', direction: 'north' };
}
