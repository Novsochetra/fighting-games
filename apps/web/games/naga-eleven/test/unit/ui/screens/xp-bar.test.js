import { describe, expect, it } from 'vitest';
import { xpForLevel, xpToNext } from '../../../../src/campaign/levels.js';
import { MAX_LEVEL } from '../../../../src/data/progression.js';
import { levelShare, xpFill, xpLeft } from '../../../../src/ui/screens/xp-bar.js';

describe('the XP bar', () => {
  it('fills by the share of the level reached', () => {
    const halfway = xpForLevel(5) + xpToNext(5) / 2;

    expect(levelShare({ level: 5, xp: xpForLevel(5) })).toBe(0);
    expect(levelShare({ level: 5, xp: halfway })).toBe(0.5);
    expect(xpLeft({ level: 5, xp: halfway })).toBe(xpToNext(5) / 2);
  });

  it('stays inside the bar for XP outside the level', () => {
    expect(levelShare({ level: 5, xp: 0 })).toBe(0);
    expect(levelShare({ level: 5, xp: xpForLevel(9) })).toBe(1);
  });

  it('stands full at the top level, with nothing left to earn', () => {
    expect(levelShare({ level: MAX_LEVEL, xp: 0 })).toBe(1);
    expect(xpLeft({ level: MAX_LEVEL, xp: 0 })).toBe(0);
  });

  it('fills on from where it stood after a match', () => {
    const before = { level: 3, xp: xpForLevel(3) + 10 };
    const after = { level: 3, xp: xpForLevel(3) + 35 };

    expect(xpFill(before, after)).toEqual({
      from: levelShare(before),
      to: levelShare(after),
      levelUp: false,
      gained: 25,
    });
  });

  it('fills again from empty when a level was gained', () => {
    const fill = xpFill({ level: 3, xp: xpForLevel(3) + 40 }, { level: 4, xp: xpForLevel(4) + 5 });

    expect(fill).toMatchObject({ from: 0, levelUp: true, gained: 15 });
  });
});
