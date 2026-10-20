import { describe, expect, it } from 'vitest';
import { VIEW_WIDTH } from '../../../../src/config.js';
import { wrapX } from '../../../../src/render/scene/ambient/index.js';
import {
  MARGIN,
  isOnScreen,
  scrollX,
  trait,
  twoFrame,
} from '../../../../src/render/scene/ambient/motion.js';

describe('ambient motion helpers', () => {
  it('wraps into [0, width) for negative and large values', () => {
    expect(wrapX(5, 100)).toBe(5);
    expect(wrapX(105, 100)).toBe(5);
    expect(wrapX(-5, 100)).toBe(95);
    expect(wrapX(-205, 100)).toBe(95);
    expect(wrapX(2.5, 10)).toBe(2.5);
  });

  it('scrolls by the camera times the drift and wraps just past both edges', () => {
    expect(scrollX(100, { cameraX: 40, drift: 0.5 })).toBe(80);
    expect(scrollX(100, { cameraX: 40 })).toBe(100);
    expect(scrollX(-MARGIN - 1, { cameraX: 0 })).toBe(VIEW_WIDTH + MARGIN - 1);
    expect(scrollX(VIEW_WIDTH + MARGIN, { cameraX: 0 })).toBe(-MARGIN);
    expect(scrollX(0, { cameraX: 0, margin: 50 })).toBe(0);
    expect(scrollX(-60, { cameraX: 0, margin: 50 })).toBe(VIEW_WIDTH + 40);
  });

  it('gives each seed and slot a stable number in [0, 1)', () => {
    expect(trait(7, 1)).toBe(trait(7, 1));
    expect(trait(7, 1)).not.toBe(trait(7, 2));
    expect(trait(7, 1)).not.toBe(trait(8, 1));
    const values = Array.from({ length: 200 }, (_, i) => trait(i, 3));
    expect(values.every((value) => value >= 0 && value < 1)).toBe(true);
  });

  it('alternates two frames, also before tick 0', () => {
    expect([0, 4, 5, 9, 10].map((ticks) => twoFrame(ticks, 5))).toEqual([0, 0, 1, 1, 0]);
    expect(twoFrame(-1, 5)).toBe(1);
  });

  it('tells whether a square touches the view', () => {
    expect(isOnScreen(0, 0, 1)).toBe(true);
    expect(isOnScreen(-2, 10, 2)).toBe(false);
    expect(isOnScreen(-1, 10, 2)).toBe(true);
    expect(isOnScreen(VIEW_WIDTH, 10, 4)).toBe(false);
    expect(isOnScreen(10, -3.6, 3)).toBe(false);
  });
});
