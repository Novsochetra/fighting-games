import { describe, expect, it } from 'vitest';
import { MOVES } from '../../../src/data/moves.js';
import { SPIRIT } from '../../../src/data/tuning.js';

const cheapestSkill = Math.min(
  ...Object.values(MOVES)
    .map((move) => move.cost)
    .filter((cost) => cost > 0),
);

describe('the spirit good play fills', () => {
  it('names a gain for each good thing a player does, each well under a skill', () => {
    expect(Object.keys(SPIRIT.gain).sort()).toEqual(
      ['beat', 'block', 'intercept', 'oneTwo', 'pass', 'parry', 'save', 'tackle'].sort(),
    );

    for (const [action, gain] of Object.entries(SPIRIT.gain)) {
      expect(gain > 0 && gain <= cheapestSkill / 3, action).toBe(true);
    }
  });

  it('pays more for winning the ball or beating a man than for a pass', () => {
    const { pass, beat, tackle, save } = SPIRIT.gain;

    expect(Math.min(beat, tackle, save)).toBeGreaterThan(pass);
  });

  it('passes a share of the side’s play to its stars, and lifts them after a goal against', () => {
    expect(SPIRIT.starShare > 0 && SPIRIT.starShare < 1).toBe(true);
    expect(SPIRIT.conceded).toBeGreaterThan(0);
    expect(SPIRIT.conceded).toBeLessThan(cheapestSkill);
  });
});
