import { describe, expect, it } from 'vitest';
import { createTrainingEar, trainingCues } from '../../../../src/audio/hear/training-cues.js';

const names = (cues) => cues.map((each) => each.cue);

describe('a drill as cues', () => {
  it('knocks a brushed cone, chimes a clean one and misses a wrong side', () => {
    const state = {
      drill: 'cone-dribble',
      run: {},
      events: [{ type: 'brush' }, { type: 'clean' }, { type: 'wrongSide' }],
    };

    expect(names(trainingCues(state, createTrainingEar()))).toEqual(['cone', 'coneClean', 'miss']);
  });

  it('kicks each new strike of the target drill once, as hard as it was struck', () => {
    const ear = createTrainingEar();
    const state = { drill: 'target-shot', run: { ball: null }, events: [] };

    trainingCues(state, ear);
    state.run.ball = { power: 0.8 };

    expect(trainingCues(state, ear)).toEqual([{ cue: 'kick', options: { power: 0.8 } }]);
    expect(trainingCues(state, ear)).toEqual([]);

    state.events = [{ type: 'hit' }];

    expect(names(trainingCues(state, ear))).toEqual(['target']);
  });

  it('beats the spirit-focus drill as each beat comes, and chimes a perfect press', () => {
    const ear = createTrainingEar();
    const run = { clock: 0, beats: [{ at: 3 }, { at: 6 }] };
    const state = { drill: 'spirit-focus', run, events: [] };
    const beats = [];

    for (let clock = 1; clock <= 8; clock += 1) {
      run.clock = clock;
      beats.push(names(trainingCues(state, ear)).includes('focusBeat'));
    }

    expect(beats).toEqual([false, false, true, false, false, true, false, false]);

    state.events = [{ type: 'perfect' }, { type: 'good' }, { type: 'stray' }];

    expect(names(trainingCues(state, ear))).toEqual(['perfect', 'focusGood', 'miss']);
  });

  it('whistles the end of a run, short when finished and long when time is up', () => {
    const state = {
      drill: 'cone-dribble',
      run: {},
      events: [{ type: 'finish' }, { type: 'timeUp' }],
    };

    expect(trainingCues(state, createTrainingEar()).map((each) => each.options.kind)).toEqual([
      'short',
      'long',
    ]);
  });
});
