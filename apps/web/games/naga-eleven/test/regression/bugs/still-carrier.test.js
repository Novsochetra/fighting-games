import { describe, expect, it } from 'vitest';
import { TICKS_PER_SECOND } from '../../../src/config.js';
import { matchInPlay, playUntil } from '../../support/match-driver.js';

// the first presser waited a step further off than a tackle on the feet reaches, so a player who
// stood on the ball kept it all match, and could run the clock down with a lead
const theyHaveIt = (match) => match.players[match.ball.owner ?? -1]?.team === 1;

describe('a player who stands on the ball', () => {
  it.each([1, 2, 3, 4, 5])('has it taken off them within ten seconds (seed %i)', (seed) => {
    const match = matchInPlay(seed, { format: '11' });

    expect(match.players[match.ball.owner].team).toBe(0);
    expect(playUntil(match, theyHaveIt, TICKS_PER_SECOND * 10)).toBe(true);
  });
});
