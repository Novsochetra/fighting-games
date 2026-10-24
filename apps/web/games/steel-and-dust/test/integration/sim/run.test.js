import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DASH_TICKS, GROUND_Y, RUN_SPEED } from '../../../src/config.js';
import { RUN_STRIDE_TICKS } from '../../../src/sim/hero-animation.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createTerrainGame, placeFighter } from '../../support/terrain-game.js';
import { createPlayingGame, press, release, runTicks, tap } from '../../support/test-game.js';

const originalRandom = Math.random;
const OLD_WALK_SPEED = 1.55;

function doubleTapAndHold(game, direction) {
  tap(game, direction);
  runTicks(game, 3);
  press(game, direction);
  runTicks(game, 1);
}

function distanceIn(game, ticks) {
  const start = game.player.x;
  runTicks(game, ticks);
  return game.player.x - start;
}

// the ticks a footstep is heard on, each with where the hero stood and whether it was in the air
function footsteps(game, sfx, ticks) {
  const heard = [];
  for (let tick = 0; tick < ticks; tick++) {
    const before = sfx.mock.calls.length;
    runTicks(game, 1);
    for (const [key, big, options] of sfx.mock.calls.slice(before)) {
      if (key === 'step') {
        heard.push({ tick, big, x: options.x, heroX: game.player.x, air: game.player.airborne });
      }
    }
  }
  return heard;
}

function runUntil(game, done, limit = 120) {
  for (let i = 0; i < limit && !done(game.player); i++) {
    runTicks(game, 1);
  }
}

describe('the hero running', () => {
  beforeEach(() => {
    Math.random = seededRandom(7);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('runs while a direction is held, picking up to the run pace, far faster than the old walk', () => {
    const game = createPlayingGame();
    runTicks(game, 30);
    press(game, 'right');
    runTicks(game, 1);
    expect(game.player.state).toBe('run');
    const ran = distanceIn(game, 79);
    expect(game.player.state).toBe('run');
    expect(game.player.vx).toBeCloseTo(RUN_SPEED, 1);
    expect(ran).toBeGreaterThan(OLD_WALK_SPEED * 80 * 1.4);
  });

  it('runs on straight out of a double-tap dash held its way', () => {
    const game = createPlayingGame();
    runTicks(game, 30);
    doubleTapAndHold(game, 'right');
    expect(game.player.state).toBe('dash');
    const states = new Set();
    for (let i = 0; i < DASH_TICKS + 10; i++) {
      runTicks(game, 1);
      states.add(game.player.state);
    }
    expect([...states]).toEqual(['dash', 'run']);
    expect(game.player.vx).toBeGreaterThan(1.7);
  });

  it('runs back the other way when the direction is turned', () => {
    const game = createPlayingGame();
    runTicks(game, 30);
    press(game, 'right');
    runTicks(game, 30);
    release(game, 'right');
    press(game, 'left');
    runTicks(game, 30);
    expect(game.player).toMatchObject({ state: 'run', facing: -1 });
    expect(game.player.vx).toBeLessThan(-2);
  });

  it('starts the light combo out of the run and strings it on', () => {
    const game = createPlayingGame();
    runTicks(game, 30);
    press(game, 'right');
    runTicks(game, 20);
    tap(game, 'light');
    expect(game.player.move.id).toBe('L1');
    runTicks(game, 8);
    tap(game, 'light');
    runUntil(game, (player) => player.move?.id !== 'L1', 30);
    expect(game.player.move.id).toBe('L2');
  });

  it('skids to a stop when the direction is let go', () => {
    const game = createPlayingGame();
    runTicks(game, 30);
    press(game, 'right');
    runTicks(game, 40);
    release(game, 'right');
    runTicks(game, 12);
    expect(game.player.state).toBe('idle');
    expect(Math.abs(game.player.vx)).toBeLessThan(0.05);
  });

  it('comes down from a running jump still running while the run is held', () => {
    const game = createPlayingGame();
    runTicks(game, 30);
    press(game, 'right');
    runTicks(game, 30);
    tap(game, 'jump');
    expect(game.player.state).toBe('air');
    runUntil(game, (player) => !player.airborne);
    runTicks(game, 1);
    expect(game.player.state).toBe('run');
  });

  it('kicks up dust and streams wind lines past the hero as it runs', () => {
    const game = createPlayingGame();
    runTicks(game, 30);
    press(game, 'right');
    runTicks(game, 40);
    expect(game.player.state).toBe('run');
    const kinds = new Set(game.particles.map((particle) => particle.kind));
    expect(kinds).toContain('dust');
    expect(kinds).toContain('streak');
  });

  it('is heard: a footstep on every stride, from where the hero is', () => {
    const sfx = vi.fn();
    const game = createPlayingGame({ io: { sfx } });
    expect(footsteps(game, sfx, 30)).toEqual([]);
    press(game, 'right');
    const heard = footsteps(game, sfx, RUN_STRIDE_TICKS * 6);
    expect(heard.length).toBeGreaterThan(4);
    const gaps = heard.slice(1).map((step, i) => step.tick - heard[i].tick);
    expect(new Set(gaps)).toEqual(new Set([RUN_STRIDE_TICKS]));
    for (const step of heard) {
      expect(step.big).toBe(false);
      expect(Math.abs(step.x - step.heroX)).toBeLessThan(RUN_SPEED * 2);
    }
  });

  it('is not heard while the hero is in the air or once it has stopped', () => {
    const sfx = vi.fn();
    const game = createPlayingGame({ io: { sfx } });
    runTicks(game, 30);
    press(game, 'right');
    runTicks(game, 30);
    tap(game, 'jump');
    const inAir = footsteps(game, sfx, 20);
    expect(game.player.airborne).toBe(true);
    expect(inAir).toEqual([]);
    release(game, 'right');
    runUntil(game, (player) => !player.airborne);
    runTicks(game, 20);
    expect(footsteps(game, sfx, RUN_STRIDE_TICKS * 3)).toEqual([]);
  });

  it('runs off a ledge into the air and lands on the road below', () => {
    const game = createTerrainGame({
      ground: [
        [60, 0],
        [60, 30],
        [200, 30],
        [200, 0],
      ],
    });
    placeFighter(game, game.player, { x: 70 });
    press(game, 'right');
    const states = new Set();
    runUntil(game, (player) => {
      states.add(player.state);
      return player.x > 240;
    });
    release(game, 'right');
    runTicks(game, 30);
    expect([...states]).toEqual(expect.arrayContaining(['run', 'air']));
    expect(game.player).toMatchObject({ y: GROUND_Y, airborne: false });
  });
});
