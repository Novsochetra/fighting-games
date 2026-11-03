import { describe, expect, it } from 'vitest';
import { createMatch } from '../../../src/sim/create-match.js';
import {
  acrossOf,
  goalOf,
  inBoxOf,
  insidePitch,
  isInMouth,
  ownGoalOf,
  progressOf,
  xAtProgress,
  yAtAcross,
} from '../../../src/sim/pitch.js';

describe('the pitch of a match', () => {
  it('sends team 0 at x = length and team 1 back at x = 0', () => {
    const match = createMatch({ seed: 1, format: '7' });

    expect(goalOf(match, 0)).toEqual({ x: 1200, y: 320 });
    expect(ownGoalOf(match, 0)).toEqual({ x: 0, y: 320 });
    expect(progressOf(match, 0, 300)).toBeCloseTo(0.25);
    expect(progressOf(match, 1, 300)).toBeCloseTo(0.75);
    expect(xAtProgress(match, 1, 0.25)).toBeCloseTo(900);
  });

  it('mirrors each side’s left and right through the centre spot', () => {
    const match = createMatch({ seed: 1 });

    expect(yAtAcross(match, 0, 0.2)).toBeCloseTo(yAtAcross(match, 1, 0.8));
    expect(acrossOf(match, 1, yAtAcross(match, 1, 0.3))).toBeCloseTo(0.3);
  });

  it('knows the goal mouth and each side’s box', () => {
    const match = createMatch({ seed: 1 });
    const middle = match.pitch.width / 2;

    expect(isInMouth(match, middle + 60)).toBe(true);
    expect(isInMouth(match, middle + 80)).toBe(false);
    expect(inBoxOf(match, 0, { x: 100, y: middle })).toBe(true);
    expect(inBoxOf(match, 1, { x: 100, y: middle })).toBe(false);
    expect(inBoxOf(match, 1, { x: match.pitch.length - 100, y: middle })).toBe(true);
  });

  it('brings a spot back onto the pitch', () => {
    const match = createMatch({ seed: 1 });

    expect(insidePitch(match, { x: -50, y: 5000 }, 10)).toEqual({
      x: 10,
      y: match.pitch.width - 10,
    });
  });
});
