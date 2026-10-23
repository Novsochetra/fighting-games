import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DASH_TICKS, GROUND_Y, RUN_SPEED } from '../../../src/config.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createTerrainGame, placeFighter } from '../../support/terrain-game.js';
import { createPlayingGame, press, release, runTicks, tap } from '../../support/test-game.js';

const originalRandom = Math.random;

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

  it('runs on out of a double-tap dash held its way, faster than a walk', () => {
    const walking = createPlayingGame();
    runTicks(walking, 30);
    press(walking, 'right');
    const walked = distanceIn(walking, 80);
    const running = createPlayingGame();
    runTicks(running, 30);
    doubleTapAndHold(running, 'right');
    expect(running.player.state).toBe('dash');
    const ran = distanceIn(running, 79);
    expect(running.player.state).toBe('run');
    expect(running.player.vx).toBeCloseTo(RUN_SPEED, 1);
    expect(ran).toBeGreaterThan(walked * 1.4);
  });

  it('skids to a stop when the direction is let go', () => {
    const game = createPlayingGame();
    runTicks(game, 30);
    doubleTapAndHold(game, 'right');
    runTicks(game, DASH_TICKS + 20);
    release(game, 'right');
    runTicks(game, 12);
    expect(game.player.state).toBe('idle');
    expect(Math.abs(game.player.vx)).toBeLessThan(0.05);
  });

  it('comes down from a running jump still running while the run is held', () => {
    const game = createPlayingGame();
    runTicks(game, 30);
    doubleTapAndHold(game, 'right');
    runTicks(game, DASH_TICKS + 10);
    tap(game, 'jump');
    expect(game.player.state).toBe('air');
    runUntil(game, (player) => !player.airborne);
    runTicks(game, 1);
    expect(game.player.state).toBe('run');
  });

  it('kicks up dust and streams wind lines past the hero as it runs', () => {
    const game = createPlayingGame();
    runTicks(game, 30);
    doubleTapAndHold(game, 'right');
    runTicks(game, DASH_TICKS + 30);
    expect(game.player.state).toBe('run');
    const kinds = new Set(game.particles.map((particle) => particle.kind));
    expect(kinds).toContain('dust');
    expect(kinds).toContain('streak');
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
    doubleTapAndHold(game, 'right');
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
