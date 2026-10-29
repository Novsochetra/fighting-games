import { describe, expect, it } from 'vitest';
import { findLast, lastOf } from '../../../src/lib/lists.js';

describe('list helpers', () => {
  it('gives the last item, or nothing for an empty list', () => {
    expect(lastOf([3, 5, 8])).toBe(8);
    expect(lastOf([])).toBeUndefined();
  });

  it('finds the last item that matches, or nothing when none does', () => {
    const steps = [
      [0, 'a'],
      [6, 'b'],
      [12, 'c'],
    ];

    expect(findLast(steps, ([at]) => at <= 7)).toBe(steps[1]);
    expect(findLast(steps, ([at]) => at <= 12)).toBe(steps[2]);
    expect(findLast(steps, ([at]) => at < 0)).toBeUndefined();
  });
});
