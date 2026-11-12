import { describe, expect, it } from 'vitest';
import { startLoop } from '../../../src/app/loop.js';

// The loop asked for its next frame only after the step, so one step that threw (a painter, a
// missing element) left no frame coming: the screen froze mid-answer and the clock with it.
describe('a frame whose step throws', () => {
  function frames() {
    const pending = [];
    const window = { requestAnimationFrame: (callback) => pending.push(callback) };

    return { window, pending, next: (now) => pending.shift()(now) };
  }

  it('still has the next frame coming', () => {
    const { window, pending, next } = frames();
    let steps = 0;

    startLoop(window, () => {
      steps += 1;

      if (steps === 2) {
        throw new Error('a painter fell over');
      }
    });
    next(0);
    expect(() => next(16)).toThrow('a painter fell over');
    next(32);

    expect(steps).toBe(3);
    expect(pending).toHaveLength(1);
  });

  it('hands the step the time since the last frame, and no more than a tenth of a second', () => {
    const { window, next } = frames();
    const steps = [];

    startLoop(window, (ms) => steps.push(ms));
    next(1000);
    next(1016);
    next(9000);

    expect(steps).toEqual([0, 16, 100]);
  });
});
