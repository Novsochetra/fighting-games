import { describe, expect, it } from 'vitest';
import { createClock, ticksDue } from '../../../src/boot/fixed-step.js';

const TICK = 1000 / 60;

describe('fixed step clock', () => {
  it('runs one tick per 60th of a second', () => {
    const clock = createClock(0);
    expect(ticksDue(clock, TICK * 3 + 1, TICK)).toBe(3);
  });

  it('keeps leftover time for the next frame', () => {
    const clock = createClock(0);
    expect(ticksDue(clock, TICK * 1.5, TICK)).toBe(1);
    expect(ticksDue(clock, TICK * 2, TICK)).toBe(1);
  });

  it('does not fast-forward after a long stall', () => {
    const clock = createClock(0);
    expect(ticksDue(clock, 5000, TICK)).toBe(5);
  });
});
