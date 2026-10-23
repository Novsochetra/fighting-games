import { describe, expect, it } from 'vitest';
import { ULT_MAX } from '../../../src/config.js';
import { createPlayingGame, press, release, runTicks, tap } from '../../support/test-game.js';

function readyGame() {
  const game = createPlayingGame();
  runTicks(game, 30);
  return game;
}

function distanceOfSlash(holdRight) {
  const game = readyGame();
  const start = game.player.x;
  game.input.held.right = holdRight;
  tap(game, 'light');
  while (game.player.state === 'attack') {
    runTicks(game, 1);
  }
  return game.player.x - start;
}

// Holding left or right through a ground attack or a heavy charge used to leave the hero planted.
describe('moving while attacking', () => {
  it('steps further into a slash while the way the hero faces is held', () => {
    const planted = distanceOfSlash(false);
    expect(distanceOfSlash(true)).toBeGreaterThan(planted + 8);
  });

  it('keeps the slash where it was when no direction is held', () => {
    expect(distanceOfSlash(false)).toBeLessThan(6);
  });

  it('does not slide backwards when the other way is held mid-swing', () => {
    const game = readyGame();
    tap(game, 'light');
    const start = game.player.x;
    game.input.held.left = true;
    runTicks(game, 4);
    expect(game.player.state).toBe('attack');
    expect(game.player.x).toBeGreaterThanOrEqual(start);
  });

  it('creeps along while charging a heavy', () => {
    const game = readyGame();
    game.ultMeter = ULT_MAX;
    press(game, 'left');
    press(game, 'heavy');
    runTicks(game, 1);
    const start = game.player.x;
    runTicks(game, 20);
    expect(game.player.state).toBe('charge');
    expect(game.player.facing).toBe(-1);
    expect(start - game.player.x).toBeGreaterThan(8);
    release(game, 'left');
    runTicks(game, 10);
    const stopped = game.player.x;
    runTicks(game, 5);
    expect(Math.abs(game.player.x - stopped)).toBeLessThan(0.5);
  });
});
