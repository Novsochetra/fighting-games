import { describe, expect, it } from 'vitest';
import { DRILL_IDS } from '../../../src/data/training.js';
import { createDrill, drillResult, liveGrade, updateDrill } from '../../../src/training/index.js';
import { BOTS, idleBot, NOTHING, playRun } from '../../integration/training/support/drill-bots.js';

const play = (drill, { seed, level, bot }) => playRun(createDrill(drill, { seed, level }), bot);

describe.each(DRILL_IDS)('grading %s', (drill) => {
  it.each([1, 2, 3])('gives a perfect run an S at level %i', (level) => {
    for (const seed of [1, 77]) {
      const state = play(drill, { seed, level, bot: BOTS[drill]() });

      expect(state.grade).toBe('S');
      expect(state.score).toBeGreaterThan(0);
    }
  });

  it('gives a run where nothing is pressed a C', () => {
    const state = play(drill, { seed: 5, level: 1, bot: idleBot });

    expect(state.grade).toBe('C');
    expect(drillResult(state)).toEqual({ drill, score: 0, grade: 'C' });
  });

  it('plays the same run from the same seed and the same presses', () => {
    const first = play(drill, { seed: 31, level: 2, bot: BOTS[drill]() });
    const second = play(drill, { seed: 31, level: 2, bot: BOTS[drill]() });

    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  it('lays out another run for another seed', () => {
    const first = createDrill(drill, { seed: 31, level: 2 });
    const second = createDrill(drill, { seed: 32, level: 2 });

    expect(JSON.stringify(second.run)).not.toBe(JSON.stringify(first.run));
  });

  it('shows no grade before anything is played, and an S all through a perfect run', () => {
    const state = createDrill(drill, { seed: 8, level: 1 });
    const bot = BOTS[drill]();
    const graded = new Set();

    updateDrill(state, { held: {}, pressed: { pass: true } });

    expect(liveGrade(state)).toBeNull();

    while (state.phase !== 'result') {
      updateDrill(state, state.phase === 'play' ? bot(state) : NOTHING);
      graded.add(liveGrade(state));
    }

    graded.delete(null);

    expect([...graded]).toEqual(['S']);
  });

  it('takes between half a minute and a minute of play', () => {
    const state = play(drill, { seed: 3, level: 1, bot: BOTS[drill]() });
    const idle = play(drill, { seed: 3, level: 1, bot: idleBot });

    for (const run of [state, idle]) {
      expect(run.tick / 60).toBeGreaterThan(20);
      expect(run.tick / 60).toBeLessThan(62);
    }
  });
});
