import { describe, expect, it } from 'vitest';
import { restartOf, startRestart } from '../../../src/sim/restart-setup.js';
import { looseBallAt, matchInPlay } from '../../support/match-driver.js';

function outAt(fields, options) {
  const match = matchInPlay(1, options);

  looseBallAt(match, fields);

  return match;
}

describe('where play starts again', () => {
  it('is a throw-in for the other side where it crossed a touchline', () => {
    const match = outAt({ x: 700, y: 1090, lastTouch: 4 });

    expect(restartOf(match)).toEqual({ kind: 'throwIn', team: 1, x: 700, y: 1080 });
  });

  it('is a corner when the defending side put it over its own goal line', () => {
    const match = outAt({ x: 1810, y: 200, lastTouch: 13 });

    expect(restartOf(match)).toEqual({ kind: 'corner', team: 0, x: 1800, y: 0 });
  });

  it('is a goal kick when the attacking side did', () => {
    const match = outAt({ x: -10, y: 900, lastTouch: 13 });
    const restart = restartOf(match);

    expect(restart).toMatchObject({ kind: 'goalKick', team: 0 });
    expect(restart.x).toBeGreaterThan(0);
    expect(restart.y).toBeGreaterThan(540);
  });
});

describe('play stopping for a restart', () => {
  it('names the taker, tells the match and hands the human their side’s taker', () => {
    const match = outAt({ x: 700, y: 1090, lastTouch: 14 }, { humanTeam: 0 });

    match.events = [];
    startRestart(match);

    const taker = match.players[match.restart.taker];

    expect(match.phase).toBe('restart');
    expect(taker.team).toBe(0);
    expect(match.controlled).toBe(taker.index);
    expect(match.events).toEqual([{ type: 'out', kind: 'throwIn', team: 0 }]);
  });

  it('has the keeper take a goal kick, and a midfielder or wide forward a corner', () => {
    const goalKick = outAt({ x: -10, y: 900, lastTouch: 13 });
    const corner = outAt({ x: 1810, y: 200, lastTouch: 13 });

    startRestart(goalKick);
    startRestart(corner);

    expect(goalKick.players[goalKick.restart.taker].role).toBe('keeper');
    expect(['midfielder', 'forward']).toContain(corner.players[corner.restart.taker].role);
    expect(corner.restart.taker).not.toBe(9);
  });
});
