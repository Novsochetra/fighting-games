import { describe, expect, it } from 'vitest';
import { followThumb, knobOffset } from '../../src/stick-math.js';

describe('stick math', () => {
  it('keeps the knob on the rim', () => {
    expect(knobOffset(30, 40, 100)).toEqual({ x: 30, y: 40 });
    expect(knobOffset(300, 400, 100)).toEqual({ x: 60, y: 80 });
  });

  it('lets a floating base follow a thumb that slides well past it', () => {
    const center = { x: 0, y: 0 };
    expect(followThumb(center, { x: 50, y: 0 }, 50)).toBe(center);
    expect(followThumb(center, { x: 100, y: 0 }, 50)).toEqual({ x: 32.5, y: 0 });
  });
});
