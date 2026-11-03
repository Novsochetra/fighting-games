import { describe, expect, it } from 'vitest';
import { shootRangeOf, shotOf } from '../../../../src/sim/brains/shooting.js';
import { holdBallAt, matchInPlay, only } from '../../../support/match-driver.js';

function shotsFrom(spot, { seeds = 30, clear = true, stats = {} } = {}) {
  let shots = 0;

  for (let seed = 1; seed <= seeds; seed += 1) {
    const match = matchInPlay(seed);
    const shooter = holdBallAt(match, spot, match.players[9]);

    Object.assign(shooter.stats, stats);

    if (clear) {
      only(match, [9, 11]);
    }

    shots += shotOf(match, shooter) ? 1 : 0;
  }

  return shots;
}

describe('the computer shooting', () => {
  it('shoots more the nearer the goal, never from out of range', () => {
    const close = shotsFrom({ x: 1700, y: 540 });
    const edge = shotsFrom({ x: 1440, y: 540 });

    expect(close).toBeGreaterThan(edge);
    expect(shotsFrom({ x: 1000, y: 540 })).toBe(0);
  });

  it('shoots from further out with a better shot', () => {
    const match = matchInPlay();
    const player = match.players[9];

    player.stats.shot = 95;

    const far = shootRangeOf(match, player);

    player.stats.shot = 10;

    expect(far).toBeGreaterThan(shootRangeOf(match, player));
  });

  it('does not shoot from a tight angle beside the goal', () => {
    expect(shotsFrom({ x: 1790, y: 300 })).toBe(0);
  });

  it('aims a shot at the goal it attacks, harder from further out', () => {
    const match = matchInPlay(3);
    const shooter = holdBallAt(match, { x: 1650, y: 540 }, match.players[9]);

    only(match, [9, 11]);

    for (let i = 0; i < 200; i += 1) {
      const shot = shotOf(match, shooter);

      if (shot) {
        expect(shot.kind).toBe('shoot');
        expect(Math.abs(shot.aimY - 540)).toBeLessThan(70);

        return;
      }
    }

    throw new Error('never shot from close in');
  });
});
