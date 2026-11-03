import { DRILLS } from '../../data/training.js';
import { comboTop, pressed } from '../scoring.js';
import { approachOf, beatCountOf, createBeats } from './beats.js';
import { judgeMissed, judgePress } from './judge.js';

const TUNING = DRILLS['spirit-focus'].tuning;

// the aura bursts over the finish, as big as the score
export const FINISH_TICKS = 150;

const SETTLE_TICKS = 30;

export function createRun(state) {
  return {
    beats: createBeats(state.random, { tuning: TUNING, level: state.level }),
    approach: approachOf(TUNING, state.level),
    clock: 0,
    spirit: 0,
  };
}

const beatsTop = (count) =>
  comboTop({
    count,
    base: TUNING.perfectPoints,
    step: TUNING.streakPoints,
    cap: TUNING.streakCap,
  });

export const topScore = (state) => beatsTop(beatCountOf(TUNING, state.level));

export const paceTop = (state) =>
  beatsTop(state.run.beats.filter((beat) => beat.rating !== null).length);

export function updateRun(state, input) {
  const run = state.run;

  run.clock += 1;

  if (pressed(input, 'pass')) {
    judgePress(state, TUNING);
  }

  judgeMissed(state, TUNING);
}

export function isRunOver(state) {
  const run = state.run;
  const last = run.beats.at(-1);

  return last.rating !== null && run.clock >= last.at + TUNING.goodWindow + SETTLE_TICKS;
}

export const burstShare = (state) => (state.topScore > 0 ? state.score / state.topScore : 0);
