import { describe, expect, it } from 'vitest';
import { triggerProblems } from '../../../../src/campaign/problems/triggers.js';
import { KNOWN } from '../../../support/campaign-fixtures.js';

const problemsOf = (...triggers) => triggerProblems({ triggers }, { known: KNOWN, where: 'm1' });

describe('the triggers on play', () => {
  it('take a combo at a level the counter shows, and a skill with or without first', () => {
    expect(
      problemsOf(
        { when: 'combo', level: 3, scene: 'mekong' },
        { when: 'combo', level: 5, boost: 'spirit' },
        { when: 'skill', first: true, scene: 'skills' },
        { when: 'skill', move: 'naga-shot', by: 'coach', scene: 'skills' },
      ),
    ).toEqual([]);
  });

  it('name a combo with no level, or one the counter never reaches', () => {
    expect(
      problemsOf(
        { when: 'combo', scene: 'mekong' },
        { when: 'combo', level: 1, scene: 'mekong' },
        { when: 'combo', level: 6, scene: 'mekong' },
        { when: 'combo', level: 2.5, scene: 'mekong' },
      ),
    ).toEqual([
      "m1 trigger 1: 'combo' needs level",
      'm1 trigger 2: level is a combo from x2 to x5',
      'm1 trigger 3: level is a combo from x2 to x5',
      'm1 trigger 4: level is a combo from x2 to x5',
    ]);
  });

  it('name a skill trigger for a move or a player the story does not know', () => {
    expect(problemsOf({ when: 'skill', move: 'moon-kick', by: 'ghost', scene: 'x' })).toEqual([
      "m1 trigger 1: unknown move 'moon-kick'",
      "m1 trigger 1: unknown character 'ghost'",
    ]);
  });
});
