import { describe, expect, it } from 'vitest';
import { aimAwayFromKeeper, stickAimY } from '../../../src/sim/aim.js';
import { matchInPlay } from '../../support/match-driver.js';

describe('aiming a shot', () => {
  it('goes for the side of the goal away from the keeper', () => {
    const match = matchInPlay();
    const middle = match.pitch.width / 2;

    match.players[11].y = middle + 20;
    expect(aimAwayFromKeeper(match, match.players[9])).toBeLessThan(middle);

    match.players[11].y = middle - 20;
    expect(aimAwayFromKeeper(match, match.players[9])).toBeGreaterThan(middle);
  });

  it('follows the stick up or down, and goes across the keeper with neither', () => {
    const match = matchInPlay();
    const middle = match.pitch.width / 2;
    const shooter = Object.assign(match.players[9], { y: middle + 200 });

    expect(stickAimY(match, shooter, { x: 1, y: -1 })).toBeLessThan(middle);
    expect(stickAimY(match, shooter, { x: 1, y: 1 })).toBeGreaterThan(middle);
    expect(stickAimY(match, shooter, { x: 1, y: 0 })).toBeLessThan(middle);
  });

  it('goes across the keeper from straight in front of the goal, never at him', () => {
    const match = matchInPlay();
    const middle = match.pitch.width / 2;
    const shooter = Object.assign(match.players[9], { y: middle });

    match.players[11].y = middle + 10;
    expect(stickAimY(match, shooter, { x: 1, y: 0 })).toBeLessThan(middle - 30);

    match.players[11].y = middle - 10;
    expect(stickAimY(match, shooter, { x: 1, y: 0 })).toBeGreaterThan(middle + 30);
  });
});
