import { describe, expect, it } from 'vitest';
import { createPlayingGame, runTicks, tap } from '../../support/test-game.js';

// Bug: pressing ULT with the bar not full showed "ULT not ready" and then threw a jab, because
// the spent ULT press still reached the idle brain as an empty button press.
describe('pressing ULT before the bar is full', () => {
  it('shows the warning and does not attack', () => {
    const game = createPlayingGame();
    runTicks(game, 30);
    game.ultMeter = 40;
    tap(game, 'ult');
    expect(game.floaters.map((floater) => floater.text)).toContain('ULT not ready');
    expect(game.player.state).not.toBe('attack');
    expect(game.player.move).toBeNull();
  });

  it('still lets the player run on that tick', () => {
    const game = createPlayingGame();
    runTicks(game, 30);
    game.input.held.right = true;
    tap(game, 'ult');
    expect(game.player.state).toBe('run');
  });

  it('starts the ultimate when the bar is full', () => {
    const game = createPlayingGame();
    runTicks(game, 30);
    game.ultMeter = 100;
    tap(game, 'ult');
    expect(game.player.state).toBe('ult');
    expect(game.ultMeter).toBe(0);
  });
});
