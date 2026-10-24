import { describe, expect, it } from 'vitest';
import {
  SWIPE_DISTANCE,
  WHEEL_DISTANCE,
  WHEEL_REST_MS,
  createWheelStepper,
  swipeStep,
} from '../../../src/home/gestures.js';

describe('swipeStep', () => {
  it('moves to the next card on a swipe left and back on a swipe right', () => {
    expect(swipeStep({ dx: -SWIPE_DISTANCE, dy: 0 })).toBe(1);
    expect(swipeStep({ dx: SWIPE_DISTANCE + 20, dy: 10 })).toBe(-1);
  });

  it('ignores taps, short drags and mostly vertical drags', () => {
    expect(swipeStep({ dx: 0, dy: 0 })).toBe(0);
    expect(swipeStep({ dx: SWIPE_DISTANCE - 1, dy: 0 })).toBe(0);
    expect(swipeStep({ dx: -60, dy: 80 })).toBe(0);
  });
});

describe('createWheelStepper', () => {
  const setup = () => {
    let time = 0;
    const feed = createWheelStepper({ now: () => time });
    return { feed, wait: (ms) => (time += ms) };
  };

  it('moves one card once a sideways scroll has travelled far enough', () => {
    const { feed } = setup();
    expect(feed({ deltaX: WHEEL_DISTANCE / 2, deltaY: 0 })).toBe(0);
    expect(feed({ deltaX: WHEEL_DISTANCE / 2, deltaY: 0 })).toBe(1);
  });

  it('ignores the rest of a flick until it settles, then takes the next swipe', () => {
    const { feed, wait } = setup();
    expect(feed({ deltaX: -WHEEL_DISTANCE, deltaY: 0 })).toBe(-1);
    wait(WHEEL_REST_MS / 2);
    expect(feed({ deltaX: -WHEEL_DISTANCE * 3, deltaY: 0 })).toBe(0);
    wait(WHEEL_REST_MS / 2);
    expect(feed({ deltaX: -WHEEL_DISTANCE, deltaY: 0 })).toBe(0);
    wait(WHEEL_REST_MS + 1);
    expect(feed({ deltaX: -WHEEL_DISTANCE, deltaY: 0 })).toBe(-1);
  });

  it('leaves vertical scrolling to the page', () => {
    const { feed } = setup();
    expect(feed({ deltaX: WHEEL_DISTANCE, deltaY: WHEEL_DISTANCE * 2 })).toBe(0);
  });
});
