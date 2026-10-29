import { describe, expect, it } from 'vitest';
import {
  isNearFixedStick,
  stickDirections,
} from '../../../../../packages/touch-pad/src/stick-math.js';

const none = { left: false, right: false, up: false, down: false };

// Fixed in b12d442: the joystick is fixed in the corner by default, a thumb has to land on or
// near it, and a thumb resting near a threshold must not flicker the direction on and off.
describe('touch joystick', () => {
  it('turns a direction on past the outer threshold', () => {
    expect(stickDirections(0.3, 0, none).right).toBe(false);
    expect(stickDirections(0.4, 0, none).right).toBe(true);
    expect(stickDirections(0, -0.65, none).up).toBe(true);
  });

  it('keeps a direction on until the thumb comes back past the inner threshold', () => {
    const walking = { ...none, right: true };
    expect(stickDirections(0.3, 0, walking).right).toBe(true);
    expect(stickDirections(0.2, 0, walking).right).toBe(false);
  });

  it('only grabs the fixed stick when the thumb lands on or near it', () => {
    const center = { x: 100, y: 300 };
    expect(isNearFixedStick(center, { x: 150, y: 300 }, 64)).toBe(true);
    expect(isNearFixedStick(center, { x: 300, y: 300 }, 64)).toBe(false);
  });
});
