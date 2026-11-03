import { describe, expect, it } from 'vitest';
import { holdStick, isHeldOver } from '../../../src/sim/stick-hold.js';
import { matchInPlay } from '../../support/match-driver.js';

describe('the stick held over from the last man steered', () => {
  it('is held over while it stays where it was, and only for the ticks given', () => {
    const match = matchInPlay();

    match.input.sources.keys.held.right = true;
    holdStick(match, 10);

    expect(isHeldOver(match, { x: 1, y: 0 })).toBe(true);

    match.tick += 10;

    expect(isHeldOver(match, { x: 1, y: 0 })).toBe(false);
  });

  it('is over for good once the stick moves, even back to where it was', () => {
    const match = matchInPlay();

    match.input.sources.keys.held.right = true;
    holdStick(match, 30);

    expect(isHeldOver(match, { x: 0, y: 0 })).toBe(false);
    expect(isHeldOver(match, { x: 1, y: 0 })).toBe(false);
  });
});
