import { describe, expect, it } from 'vitest';
import { headerPassOf } from '../../../src/sim/header-pass.js';
import { looseBallAt, matchInPlay, only } from '../../support/match-driver.js';

describe('where a header goes on to', () => {
  it('is a free mate ahead for the computer, none behind', () => {
    const match = matchInPlay(1, { humanTeam: null });

    only(match, [6, 9, 2]);
    Object.assign(match.players[6], { x: 900, y: 540 });
    Object.assign(match.players[9], { x: 1080, y: 560, stun: 0 });
    Object.assign(match.players[2], { x: 760, y: 540, stun: 0 });
    looseBallAt(match, { x: 904, y: 540, z: 44 });

    expect(headerPassOf(match, match.players[6]).x).toBeGreaterThan(1000);

    Object.assign(match.players[9], { x: 700 });

    expect(headerPassOf(match, match.players[6])).toBe(null);
  });

  it('follows the stick for the one the player steers', () => {
    const match = matchInPlay(1);

    only(match, [6, 7]);
    Object.assign(match.players[6], { x: 900, y: 540 });
    Object.assign(match.players[7], { x: 900, y: 700, stun: 0 });
    match.controlled = 6;
    match.input.sources.keys.held.down = true;
    looseBallAt(match, { x: 904, y: 540, z: 44 });

    expect(headerPassOf(match, match.players[6]).y).toBeGreaterThan(650);
  });
});
