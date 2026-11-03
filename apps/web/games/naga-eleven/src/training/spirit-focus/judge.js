import { breakCombo, pushMark, scorePoints } from '../scoring.js';
import { openBeatNear } from './beats.js';

export const SPIRIT_MAX = 100;

function changeSpirit(run, amount) {
  run.spirit = Math.max(0, Math.min(SPIRIT_MAX, run.spirit + amount));
}

function rate(state, beat, tuning) {
  const run = state.run;
  const perfect = Math.abs(run.clock - beat.at) <= tuning.perfectWindow;
  const streak = Math.min(state.combo, tuning.streakCap);
  const points = perfect
    ? tuning.perfectPoints + tuning.streakPoints * streak
    : tuning.goodPoints + (tuning.streakPoints / 2) * streak;

  beat.rating = perfect ? 'perfect' : 'good';
  beat.judgedAt = run.clock;
  scorePoints(state, points);
  changeSpirit(run, perfect ? tuning.spiritPerfect : tuning.spiritGood);
  pushMark(state, { kind: beat.rating, x: 0, y: 0, points });
}

function miss(state, kind, tuning) {
  breakCombo(state);
  changeSpirit(state.run, -tuning.spiritMiss);
  pushMark(state, { kind, x: 0, y: 0, points: 0 });
}

// a press with no beat near it breaks the streak as a missed beat does
export function judgePress(state, tuning) {
  const run = state.run;
  const beat = openBeatNear(run.beats, run.clock, tuning.goodWindow);

  if (beat) {
    rate(state, beat, tuning);
  } else {
    miss(state, 'stray', tuning);
  }
}

export function judgeMissed(state, tuning) {
  const run = state.run;

  for (const beat of run.beats) {
    if (beat.rating === null && run.clock > beat.at + tuning.goodWindow) {
      beat.rating = 'miss';
      beat.judgedAt = run.clock;
      miss(state, 'miss', tuning);
    }
  }
}
