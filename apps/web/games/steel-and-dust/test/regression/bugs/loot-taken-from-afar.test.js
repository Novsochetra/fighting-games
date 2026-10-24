import { describe, expect, it } from 'vitest';
import { createLootGame, piece } from '../../support/loot-game.js';
import { press, release, runTicks } from '../../support/test-game.js';

// Bug: the hero pulled in every coin within a few steps, so a coin the player jumped over, or only
// came near, flew into the purse on its own. A piece now stays where it lies until the hero walks
// onto it
function coinAhead(distance) {
  const { game } = createLootGame();
  runTicks(game, 2);
  const coin = piece({ x: game.player.x + distance, y: game.player.y, landed: true, time: 60 });
  game.loot = [coin];
  return { game, coin };
}

describe('a coin on the road', () => {
  it('stays where it lies while the hero stands a step away', () => {
    const { game, coin } = coinAhead(24);
    runTicks(game, 120);
    expect(game.loot).toEqual([coin]);
    expect(coin.x).toBe(game.player.x + 24);
    expect(game.coins).toBe(0);
  });

  it('stays where it lies when the hero leaps clear over it', () => {
    const { game, coin } = coinAhead(48);
    press(game, 'right');
    runTicks(game, 4);
    press(game, 'jump');
    runTicks(game, 3);
    release(game, 'jump');
    while (game.player.airborne && game.player.x < coin.x + 30) {
      runTicks(game, 1);
    }
    release(game, 'right');
    expect(game.player.x).toBeGreaterThan(coin.x);
    expect(game.loot).toEqual([coin]);
    expect(game.coins).toBe(0);
  });

  it('is taken once the hero walks onto it', () => {
    const { game } = coinAhead(48);
    press(game, 'right');
    runTicks(game, 40);
    release(game, 'right');
    expect(game.loot).toEqual([]);
    expect(game.coins).toBe(1);
  });
});
