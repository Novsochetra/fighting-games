import { describe, expect, it } from 'vitest';
import { DASH_TICKS } from '../../../src/config.js';
import { heroAnimation } from '../../../src/sim/hero-animation.js';
import { createPlayingGame, runTicks, tap } from '../../support/test-game.js';

// Fixed in b12d442: frame 0 of the dash strip is a full-body smear that looked like a glitch.
// Fixed in 1cfcafc: the dash used to stop dead; it now eases down to walking pace, and held on its
// way to its end, runs on.
describe('dash', () => {
  function dashingGame() {
    const game = createPlayingGame();
    runTicks(game, 30);
    tap(game, 'dash');
    return game;
  }

  it('never shows the smear frame of the dash strip', () => {
    const game = dashingGame();
    const frames = [];
    while (game.player.state === 'dash') {
      frames.push(heroAnimation(game.player));
      runTicks(game, 1);
    }
    expect(frames.length).toBeGreaterThan(5);
    expect(frames.every(([name, frame]) => name === 'dash' && frame >= 1 && frame <= 3)).toBe(true);
  });

  it('starts fast and slows down to walking pace', () => {
    const game = dashingGame();
    const speeds = [];
    while (game.player.state === 'dash') {
      speeds.push(Math.abs(game.player.vx));
      runTicks(game, 1);
    }
    expect(speeds).toHaveLength(DASH_TICKS - 1);
    expect(speeds[0]).toBeGreaterThan(4);
    for (let i = 1; i < speeds.length; i++) {
      expect(speeds[i]).toBeLessThanOrEqual(speeds[i - 1]);
    }
    expect(speeds.at(-1)).toBeCloseTo(1.7, 1);
    expect(game.player.state).toBe('idle');
  });

  it('flows straight into a run while its direction is held', () => {
    const game = dashingGame();
    game.input.held.right = true;
    runTicks(game, DASH_TICKS + 2);
    expect(game.player.state).toBe('run');
  });

  it('flows straight into a walk back while the other direction is held', () => {
    const game = dashingGame();
    game.input.held.left = true;
    runTicks(game, DASH_TICKS + 2);
    expect(game.player).toMatchObject({ state: 'walk', facing: -1 });
  });
});
