import { describe, expect, it } from 'vitest';
import { bulgeOf } from '../../../../src/render/venues/goals/shape.js';
import { rippleOf } from '../../../../src/render/venues/goals/ripple.js';

const matchWith = (inGoal) => ({ ball: { y: 540, z: 20, inGoal } });

describe('a net that has a ball in it', () => {
  it('ripples only at the end the ball went in, counting the ticks since', () => {
    const match = matchWith(0);

    rippleOf(match, 1, 100);

    expect(rippleOf(match, 1, 110)).toEqual({ y: 540, z: 20, age: 10 });
    expect(rippleOf(match, 0, 110)).toBeNull();
  });

  it('lies still again once the ball is out of it', () => {
    const match = matchWith(1);

    rippleOf(match, 0, 5);
    match.ball.inGoal = null;

    expect(rippleOf(match, 0, 6)).toBeNull();
  });

  it('bulges most where the ball struck, and dies away', () => {
    const fresh = { y: 540, z: 20, age: 0 };

    expect(bulgeOf(fresh, { y: 540, z: 20 })).toBeGreaterThan(bulgeOf(fresh, { y: 600, z: 20 }));
    expect(bulgeOf({ ...fresh, age: 80 }, { y: 540, z: 20 })).toBe(0);
    expect(bulgeOf(null, { y: 540, z: 20 })).toBe(0);
  });
});
