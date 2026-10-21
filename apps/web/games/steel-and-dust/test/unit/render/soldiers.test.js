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
// a finisher's soldier thrusts once
const alone = (time) => ({ time, moves: ['thrust'] });
// an ultimate's soldier waits for its rank's wave, then fights a chain of moves in step with it
const BEATS = [22, 32, 44];
const ranked = (time) => ({
  time,
  wait: 6,
  moves: ['slash1', 'cleave', 'thrust'],
  beats: BEATS,
});

describe("a finisher's relief soldier", () => {
  it('winds up while it steps out of the stone, lunges on its strike and holds the lunge', () => {
    expect(soldierFrame(alone(1))).toEqual(['thrust', 0]);
    expect(soldierFrame(alone(strike - 2))).toEqual(['thrust', 2]);
    expect(soldierFrame(alone(strike))).toEqual(['thrust', 3]);
    expect(soldierFrame(alone(crumble))).toEqual(['thrust', HERO_SPRITES.frames.thrust - 1]);
  });
});

describe("an ultimate's relief soldier", () => {
  it("strikes each move of its chain on the move's strike frame, on its beat", () => {
    expect(soldierFrame(ranked(BEATS[0]))).toEqual(['slash1', 2]);
    expect(soldierFrame(ranked(BEATS[1]))).toEqual(['cleave', 3]);
    expect(soldierFrame(ranked(BEATS[2]))).toEqual(['thrust', 3]);
  });

  it('winds up into each move and follows through after it, until halfway to the next', () => {
    expect(soldierFrame(ranked(BEATS[0] - 2))).toEqual(['slash1', 1]);
    expect(soldierFrame(ranked(BEATS[0] + 2))).toEqual(['slash1', 3]);
    expect(soldierFrame(ranked(26))).toEqual(['slash1', 4]);
    expect(soldierFrame(ranked(27))).toEqual(['cleave', 0]);
    expect(soldierFrame(ranked(crumble + BEATS[2]))).toEqual(['thrust', 5]);
  });

  it('steps forward with every blow it strikes', () => {
    expect(soldierStep(ranked(BEATS[0] - 1))).toBe(0);
    expect(soldierStep(ranked(BEATS[0]))).toBeGreaterThan(0);
    expect(soldierStep(ranked(BEATS[2]))).toBe(soldierStep(ranked(BEATS[0])) * 3);
  });
});

describe('a relief soldier stepping out of the stone', () => {
  it('rises out of the ground whole and stands on it once risen', () => {
    expect(soldierSunk(alone(0))).toBeGreaterThan(30);
    expect(soldierSunk(alone(rise / 2))).toBeLessThan(soldierSunk(alone(1)));
    expect(soldierSunk(alone(rise))).toBe(0);
    expect(soldierSunk(alone(crumble - 1))).toBe(0);
  });

  it('in a rank, stays in the ground until its wave reaches it', () => {
    expect(soldierSunk(ranked(6))).toBe(soldierSunk(alone(0)));
    expect(soldierSunk(ranked(6 + rise))).toBe(0);
  });

  it('sinks halfway back as it crumbles after its last blow, fading out, and is gone at its end', () => {
    const last = BEATS[2] - strike;
    expect(soldierSunk(ranked(crumble + last - 1))).toBe(0);
    expect(soldierSunk(ranked(end + last))).toBe(soldierSunk(alone(0)) / 2);
    expect(soldierAlpha(alone(rise))).toBe(soldierAlpha(alone(crumble - 1)));
    expect(soldierAlpha(alone(crumble + 2))).toBeLessThan(soldierAlpha(alone(crumble)));
    expect(soldierAlpha(alone(end))).toBe(0);
    expect(soldierAlpha(ranked(end + last))).toBe(0);
  });
});
