import { describe, expect, it } from 'vitest';
import { DRILL_IDS } from '../../../src/data/training.js';
import {
  createDrill,
  drillResult,
  isDrillOver,
  READY_TICKS,
  RESULT_LOCK_TICKS,
  updateDrill,
} from '../../../src/training/index.js';

const NOTHING = { held: {}, pressed: {} };
const PASS = { held: {}, pressed: { pass: true } };
const SHOOT = { held: {}, pressed: { shoot: true } };

function tickUntil(state, phase, limit = 20000) {
  for (let i = 0; i < limit && state.phase !== phase; i += 1) {
    updateDrill(state, NOTHING);
  }

  return state;
}

function idleToResult(state) {
  updateDrill(state, PASS);

  return tickUntil(state, 'result');
}

describe('a drill', () => {
  it('starts on its intro card and waits there for PASS', () => {
    const state = createDrill('cone-dribble', { seed: 3 });

    for (let i = 0; i < 300; i += 1) {
      updateDrill(state, NOTHING);
    }

    expect(state.phase).toBe('intro');

    updateDrill(state, PASS);

    expect(state.phase).toBe('ready');
  });

  it('counts READY and GO down before play', () => {
    const state = createDrill('target-shot', { seed: 3 });

    updateDrill(state, PASS);

    for (let i = 0; i < READY_TICKS - 1; i += 1) {
      updateDrill(state, NOTHING);
    }

    expect(state.phase).toBe('ready');

    updateDrill(state, NOTHING);

    expect(state.phase).toBe('play');
  });

  it('knows no drill it was not given', () => {
    expect(() => createDrill('juggling')).toThrow();
  });

  it.each(DRILL_IDS)('%s holds its result card until PASS, then is over', (drill) => {
    const state = idleToResult(createDrill(drill, { seed: 9 }));

    updateDrill(state, PASS);

    expect(state.phase).toBe('result');

    for (let i = 0; i < RESULT_LOCK_TICKS; i += 1) {
      updateDrill(state, NOTHING);
    }

    expect(isDrillOver(state)).toBe(false);

    updateDrill(state, PASS);

    expect(isDrillOver(state)).toBe(true);
    expect(drillResult(state)).toEqual({ drill, score: 0, grade: 'C' });
  });

  it('tries again from the result card, on the same course, keeping the best attempt', () => {
    const state = idleToResult(createDrill('spirit-focus', { seed: 9 }));
    const firstBeats = state.run.beats.map((beat) => beat.at);

    state.best = { score: 4000, grade: 'A' };

    for (let i = 0; i < RESULT_LOCK_TICKS; i += 1) {
      updateDrill(state, NOTHING);
    }

    updateDrill(state, SHOOT);

    expect(state.phase).toBe('ready');
    expect(state.attempt).toBe(2);
    expect(state.score).toBe(0);
    expect(state.run.beats.map((beat) => beat.at)).toEqual(firstBeats);

    tickUntil(state, 'result');

    expect(state.newBest).toBe(false);
    expect(drillResult(state)).toEqual({ drill: 'spirit-focus', score: 4000, grade: 'A' });
  });

  it('tells the app what happened this tick only', () => {
    const state = createDrill('spirit-focus', { seed: 2 });

    updateDrill(state, PASS);
    tickUntil(state, 'play');

    let missed = null;

    for (let i = 0; i < 400 && !missed; i += 1) {
      updateDrill(state, NOTHING);
      missed = state.events.find((event) => event.type === 'miss') ?? null;
    }

    expect(missed).not.toBeNull();

    updateDrill(state, NOTHING);

    expect(state.events.filter((event) => event.type === 'miss')).toHaveLength(0);
  });
});
