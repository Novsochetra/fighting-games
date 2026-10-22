import { describe, expect, it } from 'vitest';
import { HERO_SPRITES } from '../../../src/data/hero-sprites.js';
import {
  soldierAlpha,
  soldierFrame,
  soldierStep,
  soldierSunk,
} from '../../../src/render/fx/soldiers.js';
import { SOLDIER_TIMING } from '../../../src/sim/summons/soldiers.js';

const { rise, strike, crumble, end } = SOLDIER_TIMING;
const soldierAt = (time) => ({ time });

describe("a finisher's relief soldier", () => {
  it('winds up while it steps out of the stone, lunges on its strike and holds the lunge', () => {
    expect(soldierFrame(soldierAt(1))).toEqual(['thrust', 0]);
    expect(soldierFrame(soldierAt(strike - 2))).toEqual(['thrust', 2]);
    expect(soldierFrame(soldierAt(strike))).toEqual(['thrust', 3]);
    expect(soldierFrame(soldierAt(crumble))).toEqual(['thrust', HERO_SPRITES.frames.thrust - 1]);
  });

  it('steps forward as it thrusts', () => {
    expect(soldierStep(soldierAt(strike - 1))).toBe(0);
    expect(soldierStep(soldierAt(strike))).toBeGreaterThan(0);
  });

  it('rises out of the ground whole and stands on it once risen', () => {
    expect(soldierSunk(soldierAt(0))).toBeGreaterThan(30);
    expect(soldierSunk(soldierAt(rise / 2))).toBeLessThan(soldierSunk(soldierAt(1)));
    expect(soldierSunk(soldierAt(rise))).toBe(0);
    expect(soldierSunk(soldierAt(crumble - 1))).toBe(0);
  });

  it('sinks halfway back as it crumbles, fading out, and is gone at its end', () => {
    expect(soldierSunk(soldierAt(end))).toBe(soldierSunk(soldierAt(0)) / 2);
    expect(soldierAlpha(soldierAt(rise))).toBe(soldierAlpha(soldierAt(crumble - 1)));
    expect(soldierAlpha(soldierAt(crumble + 2))).toBeLessThan(soldierAlpha(soldierAt(crumble)));
    expect(soldierAlpha(soldierAt(end))).toBe(0);
  });
});
