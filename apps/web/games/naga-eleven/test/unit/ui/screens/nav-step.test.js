import { describe, expect, it } from 'vitest';
import { stepOf, wrapIndex } from '../../../../src/ui/screens/nav-step.js';

describe('a step through a screen', () => {
  it.each([
    ['up', { axis: 'move', by: -1 }],
    ['down', { axis: 'move', by: 1 }],
    ['left', { axis: 'adjust', by: -1 }],
    ['right', { axis: 'adjust', by: 1 }],
    [3, { axis: 'move', by: 1 }],
    [-1, { axis: 'move', by: -1 }],
    [['move', -1], { axis: 'move', by: -1 }],
    [['adjust', 1], { axis: 'adjust', by: 1 }],
  ])('reads %j', (step, expected) => {
    expect(stepOf(step)).toEqual(expected);
  });

  it.each([['north'], [0], [['jump', 1]], [['move', 0]], [null], [{}]])('ignores %j', (step) => {
    expect(stepOf(step)).toBe(null);
  });

  it('goes round from either end of a list', () => {
    expect(wrapIndex(0, -1, 4)).toBe(3);
    expect(wrapIndex(3, 1, 4)).toBe(0);
    expect(wrapIndex(1, 1, 4)).toBe(2);
    expect(wrapIndex(0, 1, 0)).toBe(-1);
  });
});
