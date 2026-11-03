import { describe, expect, it } from 'vitest';
import { claimRewards } from '../../../src/campaign/rewards.js';
import { newSave } from '../../../src/campaign/save.js';
import { FIXTURE_CHAPTERS, stageAt } from '../../support/campaign-fixtures.js';

const final = stageAt(FIXTURE_CHAPTERS, 0, 4);

describe("a stage's rewards", () => {
  it('are given the first time the stage is passed, and marked as given', () => {
    const claimed = claimRewards(newSave(), final, true);

    expect(claimed).toMatchObject({ xp: 40, moves: ['naga-shot'] });
    expect(claimed.save.flags['reward:chapter-1/4']).toBe(true);
  });

  it('are not given for a stage not passed, nor a second time', () => {
    const claimed = claimRewards(newSave(), final, true);

    expect(claimRewards(newSave(), final, false)).toMatchObject({ xp: 0, moves: [] });
    expect(claimRewards(claimed.save, final, true)).toMatchObject({ xp: 0, moves: [] });
  });

  it('are nothing for a stage that gives none', () => {
    expect(claimRewards(newSave(), stageAt(FIXTURE_CHAPTERS, 0, 2), true)).toMatchObject({
      xp: 0,
      moves: [],
    });
  });
});
