import { describe, expect, it } from 'vitest';

import {
  bezier,
  easeOut,
  easeOutSoft,
  phaseOf,
} from '../../../../../../dev/camera-lab/src/naga-shot/tracks/ease.js';

describe("the Naga Shot's easing", () => {
  it('measures a phase in ticks and in shares of a stage alike', () => {
    expect(phaseOf(30, 20, 20)).toBe(0.5);
    expect(phaseOf(0.7, 0.6, 0.2)).toBeCloseTo(0.5);
    expect(phaseOf(0.5, 0.6, 0.2)).toBe(0);
    expect(phaseOf(0.9, 0.6, 0.2)).toBe(1);
  });

  it('treats a span of nothing as a step', () => {
    expect(phaseOf(5, 5, 0)).toBe(1);
    expect(phaseOf(4, 5, 0)).toBe(0);
  });

  it('eases from 0 to 1, the soft way starting slower', () => {
    expect([easeOut(0), easeOut(1), easeOutSoft(0), easeOutSoft(1)]).toEqual([0, 1, 0, 1]);
    expect(easeOutSoft(0.1)).toBeLessThan(easeOut(0.1));
  });

  it('runs a curve through its ends', () => {
    const from = { x: 0, y: 10 };
    const to = { x: 40, y: 10 };

    expect(bezier(from, { x: 20, y: -10 }, to, 0)).toEqual(from);
    expect(bezier(from, { x: 20, y: -10 }, to, 1)).toEqual(to);
    expect(bezier(from, { x: 20, y: -10 }, to, 0.5).y).toBeLessThan(10);
  });
});
