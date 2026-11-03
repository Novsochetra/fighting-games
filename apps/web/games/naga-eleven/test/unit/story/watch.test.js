import { describe, expect, it } from 'vitest';
import { checkTriggers, createWatch } from '../../../src/story/watch.js';
import { fakeMatch, goal } from '../../support/story-fixtures.js';

describe('a match watch', () => {
  it('fires each trigger once a match', () => {
    const watch = createWatch([{ when: 'goalFor', scene: 'for' }]);

    expect(checkTriggers(watch, fakeMatch({ score: [1, 0] }), [goal(0)])).toHaveLength(1);
    expect(checkTriggers(watch, fakeMatch({ score: [2, 0] }), [goal(0)])).toEqual([]);
  });

  it('says what fired: the scene, the move unlocked and the boost', () => {
    const watch = createWatch([
      { when: 'losingLate', minute: 30, scene: 'naga', unlock: 'naga-shot', boost: 'spirit' },
    ]);
    const match = fakeMatch({ phase: 'play', minute: 32, score: [0, 1] });

    expect(checkTriggers(watch, match, [])).toEqual([
      { when: 'losingLate', scene: 'naga', unlock: 'naga-shot', boost: 'spirit' },
    ]);
  });

  it('fires all that happen at once, in the order listed', () => {
    const watch = createWatch([
      { when: 'goalFor', scene: 'second' },
      { when: 'goalFor', first: true, scene: 'first' },
      { when: 'specialGoal', unlock: 'twin-naga' },
    ]);
    const fired = checkTriggers(watch, fakeMatch({ score: [1, 0] }), [goal(0, 6, 'naga-shot')]);

    expect(fired).toEqual([
      { when: 'goalFor', scene: 'second', unlock: null, boost: null },
      { when: 'goalFor', scene: 'first', unlock: null, boost: null },
      { when: 'specialGoal', scene: null, unlock: 'twin-naga', boost: null },
    ]);
  });

  it('reads the match’s own events when none are handed in', () => {
    const watch = createWatch([{ when: 'goalAgainst', scene: 'against' }]);
    const match = fakeMatch({ score: [0, 1], events: [goal(1, 13)] });

    expect(checkTriggers(watch, match)).toHaveLength(1);
  });

  it('ignores a trigger it does not know and watches nothing when given nothing', () => {
    expect(checkTriggers(createWatch([{ when: 'rainbow' }]), fakeMatch(), [])).toEqual([]);
    expect(checkTriggers(createWatch(), fakeMatch(), [])).toEqual([]);
  });
});
