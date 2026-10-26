import { describe, expect, it } from 'vitest';
import { slideFrames } from '../../../src/arcade/stack-motion';

const look = { offsetUnder: '-30%', dimUnder: '0.9', shadow: 'shadow', reduced: false };

describe('slideFrames', () => {
  it('slides a pushed screen in from the right over the one it covers, which slips left and dims', () => {
    const { front, back } = slideFrames('push', look);

    expect(front).toEqual([
      { translate: '100% 0', boxShadow: 'shadow' },
      { translate: '0 0', boxShadow: 'shadow' },
    ]);
    expect(back.at(-1)).toEqual({ translate: '-30% 0', filter: 'brightness(0.9)' });
  });

  it('plays a pop as the push backwards', () => {
    const push = slideFrames('push', look);
    const pop = slideFrames('pop', look);

    expect(pop.front).toEqual([...push.front].reverse());
    expect(pop.back).toEqual([...push.back].reverse());
  });

  it('only fades with reduced motion, as iOS dissolves', () => {
    const { front, back } = slideFrames('push', { ...look, reduced: true });

    expect(front).toEqual([{ opacity: 0 }, { opacity: 1 }]);
    expect(back.map((frame) => frame.translate)).toEqual(['0 0', '0 0']);
  });
});
