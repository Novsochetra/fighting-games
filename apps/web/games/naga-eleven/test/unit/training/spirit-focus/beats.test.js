import { describe, expect, it } from 'vitest';
import { DRILLS } from '../../../../src/data/training.js';
import { createRandom } from '../../../../src/sim/random.js';
import { createDrill } from '../../../../src/training/index.js';
import {
  beatCountOf,
  createBeats,
  openBeatNear,
} from '../../../../src/training/spirit-focus/beats.js';
import { isRunOver, updateRun } from '../../../../src/training/spirit-focus/index.js';

const TUNING = DRILLS['spirit-focus'].tuning;
const NOTHING = { held: {}, pressed: {} };
const PASS = { held: {}, pressed: { pass: true } };

function inPlay(level = 1) {
  const state = createDrill('spirit-focus', { seed: 6, level });

  state.phase = 'play';

  return state;
}

function tickTo(state, clock, input = NOTHING) {
  while (state.run.clock < clock - 1) {
    updateRun(state, NOTHING);
  }

  updateRun(state, input);
}

describe('the beats', () => {
  it('come faster as the drill goes on', () => {
    const beats = createBeats(createRandom(3), { tuning: TUNING, level: 1 });
    const gaps = beats.slice(1).map((beat, i) => beat.at - beats[i].at);
    const average = (list) => list.reduce((sum, gap) => sum + gap, 0) / list.length;

    expect(average(gaps.slice(0, 6))).toBeGreaterThan(average(gaps.slice(-6)) * 1.5);
  });

  it('are more at a higher level, and the same for the same seed', () => {
    expect(createBeats(createRandom(3), { tuning: TUNING, level: 3 })).toHaveLength(
      beatCountOf(TUNING, 3),
    );
    expect(beatCountOf(TUNING, 3)).toBeGreaterThan(beatCountOf(TUNING, 1));
    expect(createBeats(createRandom(3), { tuning: TUNING, level: 2 })).toEqual(
      createBeats(createRandom(3), { tuning: TUNING, level: 2 }),
    );
  });

  it('find the open beat a press is for, inside the window only', () => {
    const beats = [
      { at: 100, rating: 'perfect' },
      { at: 130, rating: null },
    ];

    expect(openBeatNear(beats, 125, 10)).toBe(beats[1]);
    expect(openBeatNear(beats, 100, 10)).toBeNull();
    expect(openBeatNear(beats, 141, 10)).toBeNull();
  });
});

describe('keeping the beat', () => {
  it('rates a press on the beat perfect and one a little off good', () => {
    const state = inPlay();
    const [first, second] = state.run.beats;

    tickTo(state, first.at, PASS);
    tickTo(state, second.at + TUNING.perfectWindow + 2, PASS);

    expect(first.rating).toBe('perfect');
    expect(second.rating).toBe('good');
    expect(state.score).toBe(TUNING.perfectPoints + TUNING.goodPoints + TUNING.streakPoints / 2);
    expect(state.combo).toBe(2);
  });

  it('grows the spirit with each beat kept', () => {
    const state = inPlay();

    tickTo(state, state.run.beats[0].at, PASS);

    expect(state.run.spirit).toBe(TUNING.spiritPerfect);
  });

  it('breaks the streak for a beat let pass, and for a press off the beat', () => {
    const state = inPlay();
    const [first, second] = state.run.beats;

    tickTo(state, first.at, PASS);
    tickTo(state, first.at + TUNING.goodWindow + 1);

    expect(state.combo).toBe(1);

    tickTo(state, second.at + TUNING.goodWindow + 1);

    expect(second.rating).toBe('miss');
    expect(state.combo).toBe(0);
    expect(state.marks.at(-1).kind).toBe('miss');

    tickTo(state, state.run.beats[2].at - TUNING.goodWindow - 6, PASS);

    expect(state.marks.at(-1).kind).toBe('stray');
  });

  it('is over once the last beat has gone by', () => {
    const state = inPlay();

    while (!isRunOver(state)) {
      updateRun(state, NOTHING);
    }

    expect(state.run.beats.every((beat) => beat.rating === 'miss')).toBe(true);
    expect(state.score).toBe(0);
  });
});
