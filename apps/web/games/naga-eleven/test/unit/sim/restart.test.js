import { describe, expect, it } from 'vitest';
import { PHASE_TICKS } from '../../../src/data/tuning.js';
import { startRestart } from '../../../src/sim/restart-setup.js';
import { restartTick } from '../../../src/sim/restart.js';
import { distance } from '../../../src/sim/vector.js';
import { looseBallAt, matchInPlay, playTicks } from '../../support/match-driver.js';

function throwInFor(team, options) {
  const match = matchInPlay(4, options);

  looseBallAt(match, { x: 800, y: -6, vy: -3, lastTouch: team === 0 ? 14 : 4 });
  startRestart(match);

  return match;
}

function runRestart(match, most = 600) {
  for (let i = 0; i < most && match.phase === 'restart'; i += 1) {
    match.phaseTicks += 1;
    match.tick += 1;
    restartTick(match);
  }
}

describe('a restart', () => {
  it('puts the ball back on its spot once it has rolled away', () => {
    const match = throwInFor(1);

    for (let i = 0; i <= PHASE_TICKS.outRoll; i += 1) {
      match.phaseTicks += 1;
      restartTick(match);
    }

    expect(match.ball).toMatchObject({ x: 800, y: 0, owner: null });
  });

  it('walks the taker to the ball, who takes it there and plays it on', () => {
    const match = throwInFor(1);
    const taker = match.players[match.restart.taker];

    match.events = [];
    runRestart(match);

    expect(match.phase).toBe('play');
    expect(match.restart).toBe(null);
    expect(distance(taker, { x: 800, y: 0 })).toBeLessThan(20);
    expect(match.events).toContainEqual({ type: 'pass', player: taker.index });
  });

  it('waits for the human to aim and pass when it is theirs', () => {
    const match = throwInFor(0, { humanTeam: 0 });
    const taker = match.players[match.restart.taker];

    runRestart(match, 400);

    expect(match.phase).toBe('restart');
    expect(match.ball.owner).toBe(taker.index);
    expect(match.ball.z).toBeGreaterThan(20);

    playTicks(match, 1, { held: { pass: true, right: true }, pressed: { pass: true } });
    playTicks(match, 1, { held: { pass: false } });

    expect(match.phase).toBe('play');
    expect(match.ball.owner).toBe(null);
  });

  it('plays a corner on, the other side kept back from it while it is taken', () => {
    const match = matchInPlay(4, { humanTeam: null });
    let closest = Infinity;

    looseBallAt(match, { x: 1810, y: 100, vx: 3, lastTouch: 13 });
    startRestart(match);

    for (let i = 0; i < 600 && match.phase === 'restart'; i += 1) {
      match.phaseTicks += 1;
      restartTick(match);

      const gaps = match.sides[1].map((player) => distance(player, { x: 1800, y: 0 }));

      closest = match.phaseTicks > 200 ? Math.min(closest, ...gaps) : closest;
    }

    expect(match.phase).toBe('play');
    expect(closest).toBeGreaterThan(90);
  });
});
