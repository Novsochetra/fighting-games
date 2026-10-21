import { describe, expect, it } from 'vitest';
import { soldierAlpha, soldierFrame } from '../../../src/render/fx/soldiers.js';
import { SOLDIER_TIMING } from '../../../src/sim/summons/soldiers.js';

const { rise, strike, crumble, end } = SOLDIER_TIMING;

describe("a relief soldier's frames", () => {
  it('stays coiled while it steps out of the stone, lunges on its strike and holds the lunge', () => {
    expect([1, rise - 1].map(soldierFrame)).toEqual([
      ['thrust', 1],
      ['thrust', 1],
    ]);
    expect([rise, strike - 1].map(soldierFrame)).toEqual([
      ['thrust', 2],
      ['thrust', 2],
    ]);
    expect(soldierFrame(strike)).toEqual(['thrust', 3]);
    expect(soldierFrame(crumble)).toEqual(['thrust', 4]);
  });

  it('fades in as it rises and out as it crumbles, and is gone at its end', () => {
    expect(soldierAlpha(1)).toBeLessThan(soldierAlpha(rise - 1));
    expect(soldierAlpha(strike)).toBe(soldierAlpha(crumble - 1));
    expect(soldierAlpha(crumble + 2)).toBeLessThan(soldierAlpha(crumble));
    expect(soldierAlpha(end)).toBe(0);
  });
});
