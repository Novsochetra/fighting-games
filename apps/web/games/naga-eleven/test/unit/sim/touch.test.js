import { describe, expect, it } from 'vitest';
import { KICK } from '../../../src/data/tuning.js';
import { receive, take } from '../../../src/sim/touch.js';
import { looseBallAt, matchInPlay, only } from '../../support/match-driver.js';

describe('taking the ball', () => {
  it('makes the player its owner and ends every pass on its way', () => {
    const match = matchInPlay();

    match.players[3].receiving = 30;
    match.players[14].receiving = 30;
    take(match, match.players[3]);

    expect(match.ball.owner).toBe(3);
    expect(match.players[14].receiving).toBe(0);
  });
});

describe('a first touch', () => {
  it('brings a soft ball down every time', () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      const match = matchInPlay(seed);

      looseBallAt(match, { x: 500, y: 300, vx: 3 });
      receive(match, match.players[3]);

      expect(match.ball.owner).toBe(3);
    }
  });

  it('lets a hard ball run off a poor touch more than a good one', () => {
    const heavyShare = (dribble) => {
      let heavy = 0;

      for (let seed = 1; seed <= 60; seed += 1) {
        const match = matchInPlay(seed);

        only(match, [3]);
        match.players[3].stats.dribble = dribble;
        looseBallAt(match, { x: 500, y: 300, vx: 13 });
        receive(match, match.players[3]);
        heavy += match.ball.owner === null ? 1 : 0;
      }

      return heavy;
    };

    expect(heavyShare(10)).toBeGreaterThan(heavyShare(95));
  });
});

describe('a long ball dropping to the mate it was played to', () => {
  it('is brought down more often than one at the same pace he was not waiting for', () => {
    const takenOf = (receiving) => {
      let taken = 0;

      for (let seed = 1; seed <= 60; seed += 1) {
        const match = matchInPlay(seed);

        only(match, [3]);
        Object.assign(match.players[3], { receiving, noPickup: 0, stun: 0 });
        match.players[3].stats.dribble = 30;
        looseBallAt(match, { x: 500, y: 300, z: 30, vx: 11, vz: -3 });
        receive(match, match.players[3]);
        taken += match.ball.owner === 3 ? 1 : 0;
      }

      return taken;
    };

    expect(takenOf(40)).toBeGreaterThan(takenOf(0) + 10);
  });

  it('is brought down less often with an opponent at his back', () => {
    const takenOf = (marked) => {
      let taken = 0;

      for (let seed = 1; seed <= 60; seed += 1) {
        const match = matchInPlay(seed);

        only(match, [3, 14]);
        Object.assign(match.players[3], { x: 500, y: 300, receiving: 40, noPickup: 0, stun: 0 });
        Object.assign(match.players[14], { x: marked ? 500 + KICK.pressedGap / 2 : 900, y: 300 });
        match.players[3].stats.dribble = 30;
        looseBallAt(match, { x: 500, y: 300, z: 30, vx: 11, vz: -3 });
        receive(match, match.players[3]);
        taken += match.ball.owner === 3 ? 1 : 0;
      }

      return taken;
    };

    expect(takenOf(true)).toBeLessThan(takenOf(false));
  });
});
