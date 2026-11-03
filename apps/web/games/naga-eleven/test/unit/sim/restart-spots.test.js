import { describe, expect, it } from 'vitest';
import { startRestart } from '../../../src/sim/restart-setup.js';
import { restartSpotOf, takerSpotOf } from '../../../src/sim/restart-spots.js';
import { planTeams } from '../../../src/sim/team-plan.js';
import { distance } from '../../../src/sim/vector.js';
import { looseBallAt, matchInPlay } from '../../support/match-driver.js';

function restartAt(fields) {
  const match = matchInPlay(6);

  looseBallAt(match, fields);
  startRestart(match);
  Object.assign(match.ball, { x: match.restart.x, y: match.restart.y });
  planTeams(match);

  return match;
}

describe('where the taker stands', () => {
  it('is over the touchline at a throw-in and behind the flag at a corner', () => {
    const throwIn = restartAt({ x: 700, y: 1090, lastTouch: 14 });
    const corner = restartAt({ x: 1810, y: 100, lastTouch: 13 });

    expect(takerSpotOf(throwIn).y).toBeGreaterThan(1080);
    expect(takerSpotOf(corner).x).toBeGreaterThan(1800);
    expect(takerSpotOf(corner).y).toBeLessThan(0);
  });
});

describe('where the others stand', () => {
  it('keeps the other side well back from a goal kick', () => {
    const match = restartAt({ x: -10, y: 300, lastTouch: 15 });

    for (const player of match.sides[1]) {
      expect(distance(restartSpotOf(match, player), match.restart)).toBeGreaterThan(170);
    }
  });

  it('brings two mates near the line for a throw-in', () => {
    const match = restartAt({ x: 900, y: 1090, lastTouch: 14 });
    const near = match.sides[0].filter(
      (player) =>
        player.index !== match.restart.taker &&
        distance(restartSpotOf(match, player), match.restart) < 130,
    );

    expect(near.length).toBeGreaterThanOrEqual(2);
  });

  it('crowds the box at a corner, the striker of the side defending it left up the pitch', () => {
    const match = restartAt({ x: 1810, y: 100, lastTouch: 13 });
    const inBox = (player) => {
      const spot = restartSpotOf(match, player);

      return spot.x > match.pitch.length - 300 && Math.abs(spot.y - 540) < 320;
    };

    expect(match.sides[0].filter(inBox).length).toBeGreaterThanOrEqual(5);
    expect(match.sides[1].filter(inBox).length).toBeGreaterThanOrEqual(7);
    expect(restartSpotOf(match, match.players[20]).x).toBeLessThan(1200);
  });
});
