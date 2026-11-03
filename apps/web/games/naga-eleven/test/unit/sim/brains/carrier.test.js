import { describe, expect, it } from 'vitest';
import { carrierIntent } from '../../../../src/sim/brains/carrier.js';
import { holdBallAt, matchInPlay, only } from '../../../support/match-driver.js';

function decisions(setUp, ticks = 120) {
  const kinds = {};

  for (let seed = 1; seed <= 10; seed += 1) {
    const match = matchInPlay(seed, { humanTeam: null });
    const carrier = setUp(match);

    for (let i = 0; i < ticks; i += 1) {
      carrier.holding = 20;

      const { action } = carrierIntent(match, carrier);
      const kind = action?.kind ?? 'dribble';

      kinds[kind] = (kinds[kind] ?? 0) + 1;
    }
  }

  return kinds;
}

describe('the computer on the ball', () => {
  it('runs on with the ball into open space up the pitch', () => {
    const kinds = decisions((match) => {
      only(match, [6]);

      return holdBallAt(match, { x: 700, y: 540 }, match.players[6]);
    });

    expect(kinds.dribble).toBeGreaterThan(1000);
  });

  it('shoots close in, often', () => {
    const kinds = decisions((match) => {
      only(match, [9, 11]);

      return holdBallAt(match, { x: 1650, y: 540 }, match.players[9]);
    }, 20);

    expect(kinds.shoot).toBeGreaterThan(10);
  });

  it('passes to a free mate when pressed from the side', () => {
    const kinds = decisions((match) => {
      only(match, [6, 9, 17]);
      Object.assign(match.players[9], { x: 1000, y: 700, stun: 0 });
      Object.assign(match.players[17], { x: 700, y: 512, stun: 0 });

      return holdBallAt(match, { x: 700, y: 540 }, match.players[6]);
    });

    expect(kinds.pass).toBeGreaterThan(5);
  });

  it('clears it long when pressed deep in its own half with no pass on', () => {
    const kinds = decisions((match) => {
      only(match, [3, 19]);
      Object.assign(match.players[19], { x: 222, y: 540, stun: 0 });

      return holdBallAt(match, { x: 200, y: 540 }, match.players[3]);
    });

    expect(kinds.clear).toBeGreaterThan(5);
  });

  it('lets a computer star with spirit go as a special, with the duels attached', () => {
    const kinds = decisions((match) => {
      only(match, [20, 0]);
      match.hooks = { special: () => true };
      Object.assign(match.players[20], {
        star: 'rithy',
        moves: ['preah-khan-strike'],
        spirit: 100,
      });

      return holdBallAt(match, { x: 120, y: 540 }, match.players[20]);
    }, 20);

    expect(kinds.special).toBeGreaterThan(5);
  });
});
