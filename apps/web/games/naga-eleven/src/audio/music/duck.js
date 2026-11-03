import { DUCKS } from '../../data/audio.js';
import { holdAt } from '../nodes.js';

// the music steps back under a big moment and returns; a deeper duck still on is left alone
export function duckMusic(audio, kind) {
  const plan = DUCKS[kind];

  if (!plan || !audio.chain) {
    return false;
  }

  const now = audio.context.currentTime;

  if (now < audio.duck.until && audio.duck.depth < plan.depth) {
    return false;
  }

  const level = audio.chain.duck.gain;

  holdAt(level, now);
  level.setTargetAtTime(plan.depth, now, 0.06);
  level.setTargetAtTime(1, now + plan.hold, plan.release);
  audio.duck = { until: now + plan.hold, depth: plan.depth };

  return true;
}
