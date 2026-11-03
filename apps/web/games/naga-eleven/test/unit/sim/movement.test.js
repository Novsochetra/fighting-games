import { describe, expect, it } from 'vitest';
import { KEEPER, PLAYER } from '../../../src/data/tuning.js';
import { movePlayer, separatePlayers, tickTimers } from '../../../src/sim/movement.js';
import { matchInPlay } from '../../support/match-driver.js';

const RIGHT = { x: 1, y: 0 };

function runFor(match, player, { ticks, sprint = false }) {
  for (let i = 0; i < ticks; i += 1) {
    movePlayer(match, player, { move: RIGHT, sprint, action: null });
  }

  return player.vx;
}

function runner(match, stats) {
  const player = match.players[5];

  Object.assign(player, { x: 300, y: 500, vx: 0, vy: 0, energy: 1 });
  Object.assign(player.stats, stats);

  return player;
}

describe('a player running', () => {
  it('runs faster with more speed, and faster still sprinting', () => {
    const match = matchInPlay();
    const slow = runFor(match, runner(match, { speed: 20 }), { ticks: 40 });
    const fast = runFor(match, runner(match, { speed: 90 }), { ticks: 40 });
    const sprint = runFor(match, runner(match, { speed: 90 }), { ticks: 40, sprint: true });

    expect(fast).toBeGreaterThan(slow);
    expect(sprint).toBeGreaterThan(fast);
  });

  it('runs a little slower with the ball, less so for a good dribbler', () => {
    const match = matchInPlay();
    const free = runFor(match, runner(match, { dribble: 50 }), { ticks: 40 });
    const carrier = runner(match, { dribble: 20 });

    match.ball.owner = carrier.index;

    const clumsy = runFor(match, carrier, { ticks: 40 });
    const skilful = runFor(match, runner(match, { dribble: 95 }), { ticks: 40 });

    expect(clumsy).toBeLessThan(free);
    expect(skilful).toBeGreaterThan(clumsy);
  });

  it('tires sprinting, the sooner the less stamina, and slows to a run', () => {
    const match = matchInPlay();
    const weak = runner(match, { stamina: 10 });

    runFor(match, weak, { ticks: 400, sprint: true });

    const weakEnergy = weak.energy;
    const strong = runner(match, { stamina: 95 });

    runFor(match, strong, { ticks: 400, sprint: true });

    expect(weakEnergy).toBeLessThan(strong.energy);
    expect(weakEnergy).toBe(0);
  });

  it('turns to face where they run', () => {
    const match = matchInPlay();
    const player = runner(match, {});

    movePlayer(match, player, { move: { x: 0, y: -1 }, sprint: false, action: null });

    expect(player.facing).toEqual({ x: 0, y: -1 });
  });

  it('stays near the pitch', () => {
    const match = matchInPlay();
    const player = runner(match, {});

    Object.assign(player, { x: match.pitch.length - 2 });
    runFor(match, player, { ticks: 200 });

    expect(player.x).toBe(match.pitch.length + PLAYER.worldMargin);
  });
});

describe('a keeper diving', () => {
  it('flies on without steering and gets up after the dive', () => {
    const match = matchInPlay();
    const keeper = match.players[0];

    Object.assign(keeper, { vx: 0, vy: 4, dive: { tick: match.tick, side: 1 } });
    movePlayer(match, keeper, { move: { x: 0, y: -1 }, sprint: false, action: null });

    expect(keeper.vy).toBeGreaterThan(0);

    match.tick += KEEPER.diveTicks + 1;
    tickTimers(match, keeper);

    expect(keeper.dive).toBe(null);
  });
});

describe('players close together', () => {
  it('shoulder each other apart', () => {
    const first = { x: 100, y: 100 };
    const second = { x: 104, y: 100 };

    separatePlayers([first, second]);

    expect(second.x - first.x).toBeCloseTo(PLAYER.radius * 2);
  });
});

describe('a player in a hurry', () => {
  it('runs faster when the brain asks, as a restart taker does', () => {
    const match = matchInPlay();
    const player = runner(match, { speed: 50 });

    for (let i = 0; i < 40; i += 1) {
      movePlayer(match, player, { move: RIGHT, sprint: false, haste: 1.5, action: null });
    }

    expect(player.vx).toBeGreaterThan(
      runFor(match, runner(match, { speed: 50 }), { ticks: 40 }) * 1.4,
    );
  });
});
