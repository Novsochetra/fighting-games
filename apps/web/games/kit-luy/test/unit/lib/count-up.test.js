import { describe, expect, it } from 'vitest';
import { countUp } from '../../../src/lib/count-up.js';

describe('countUp', () => {
  it('rolls to the target by whole steps and stops on it', () => {
    let shown = 0;
    const seen = [];

    for (let frame = 0; frame < 60 && shown < 4300; frame++) {
      shown = countUp(shown, 4300, 100);
      seen.push(shown);
    }

    expect(shown).toBe(4300);
    expect(seen.every((value) => value % 100 === 0)).toBe(true);
    expect(seen.length).toBeGreaterThan(3);
    expect(seen.length).toBeLessThan(40);
  });

  it('never passes the target, and falls straight to a lower one', () => {
    expect(countUp(900, 1000, 100)).toBe(1000);
    expect(countUp(5000, 0, 100)).toBe(0);
  });
});
