import { describe, expect, it } from 'vitest';
import { metFlag, rewardFlag, withFlags } from '../../../src/campaign/flags.js';

describe('the save flags', () => {
  it('name a team met and a stage rewarded', () => {
    expect(metFlag('japan-youth')).toBe('met:japan-youth');
    expect(rewardFlag({ chapterId: 'chapter-3', stage: 6 })).toBe('reward:chapter-3/6');
  });

  it('are raised in a copy, keeping the flags already there', () => {
    const save = { flags: { seen: true } };
    const raised = withFlags(save, ['a', 'b']);

    expect(raised.flags).toEqual({ seen: true, a: true, b: true });
    expect(save.flags).toEqual({ seen: true });
  });
});
