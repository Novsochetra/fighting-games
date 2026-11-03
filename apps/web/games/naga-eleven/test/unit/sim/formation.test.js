import { describe, expect, it } from 'vitest';
import { FORMATS } from '../../../src/data/formats.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { homeSpot, kickerOf, kickoffSpot } from '../../../src/sim/formation.js';
import { matchInPlay } from '../../support/match-driver.js';

const plan = (attacking) => ({ attacking, chaser: null, pressers: [], cover: null, marks: {} });

describe('the formats', () => {
  it('give 7 v 7 a keeper, two defenders, three midfielders and a forward', () => {
    const roles = FORMATS['7'].formation.map((slot) => slot.role);

    expect(roles).toEqual([
      'keeper',
      'defender',
      'defender',
      'midfielder',
      'midfielder',
      'midfielder',
      'forward',
    ]);
  });

  it('give 11 v 11 a 4-3-3 with index 9 the centre forward', () => {
    const { formation } = FORMATS['11'];

    expect(formation.filter((slot) => slot.role === 'defender')).toHaveLength(4);
    expect(formation.filter((slot) => slot.role === 'forward')).toHaveLength(3);
    expect(formation[9]).toMatchObject({ role: 'forward', across: 0.5 });
  });
});

describe('the kick off', () => {
  it('lines each team up in its own half, the kicker at the ball', () => {
    for (const format of ['7', '11']) {
      const match = createMatch({ seed: 1, format });
      const half = match.pitch.length / 2;

      for (const kickingTeam of [0, 1]) {
        for (const player of match.players) {
          const spot = kickoffSpot(match, player, kickingTeam);
          const ownHalf = player.team === 0 ? spot.x <= half : spot.x >= half;

          expect(ownHalf).toBe(true);
        }

        expect(kickoffSpot(match, kickerOf(match, kickingTeam), kickingTeam).y).toBe(
          match.pitch.width / 2,
        );
      }
    }
  });

  it('keeps the side not kicking off out of the centre circle', () => {
    const match = createMatch({ seed: 1 });
    const centre = { x: match.pitch.length / 2, y: match.pitch.width / 2 };

    for (const player of match.sides[1]) {
      const spot = kickoffSpot(match, player, 0);

      expect(Math.hypot(spot.x - centre.x, spot.y - centre.y)).toBeGreaterThan(
        FORMATS['11'].centreCircle,
      );
    }
  });
});

describe('the shape in play', () => {
  it('slides up the pitch with the ball', () => {
    const match = matchInPlay();
    const defender = match.players[2];

    match.ball.x = 300;

    const back = homeSpot(match, defender).x;

    match.ball.x = 1500;

    expect(homeSpot(match, defender).x).toBeGreaterThan(back);
  });

  it('pushes on and spreads out when the team has the ball', () => {
    const match = matchInPlay();
    const winger = match.players[8];

    match.plans = [plan(false), plan(true)];

    const without = homeSpot(match, winger);

    match.plans = [plan(true), plan(false)];

    const withBall = homeSpot(match, winger);

    expect(withBall.x).toBeGreaterThan(without.x);
    expect(Math.abs(withBall.y - 540)).toBeGreaterThan(Math.abs(without.y - 540));
  });

  it('stays on the pitch wherever the ball is', () => {
    const match = matchInPlay();

    for (const [x, y] of [
      [0, 0],
      [match.pitch.length, match.pitch.width],
    ]) {
      Object.assign(match.ball, { x, y });

      for (const player of match.players) {
        const spot = homeSpot(match, player);

        expect(spot.x).toBeGreaterThan(0);
        expect(spot.x).toBeLessThan(match.pitch.length);
        expect(spot.y).toBeGreaterThan(0);
        expect(spot.y).toBeLessThan(match.pitch.width);
      }
    }
  });
});
