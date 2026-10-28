import { describe, expect, it } from 'vitest';
import { BURROW, DROP } from '../../../src/data/ambush.js';
import { burrowSpot, dropSpot, pendingAmbushes } from '../../../src/sim/stage/ambush.js';
import { createPlayingGame } from '../../support/test-game.js';

function gameAt(heroX, arena = { left: 0, right: 384 }) {
  const game = createPlayingGame();

  game.arena = arena;
  game.player.x = heroX;

  return game;
}

describe('where an ambushing raider comes in', () => {
  it('drops beside the hero on either side, then on top of them, then further out', () => {
    const game = gameAt(190);
    expect([0, 1, 2, 3, 4].map((slot) => dropSpot(game, slot))).toEqual([
      190 - DROP.gap,
      190 + DROP.gap,
      190,
      190 - DROP.gap * 2,
      190 + DROP.gap * 2,
    ]);
  });

  it('drops inside the screen even beside a hero at its edge', () => {
    const game = gameAt(20);
    expect(dropSpot(game, 0)).toBeGreaterThanOrEqual(18);
    expect(dropSpot(gameAt(370), 1)).toBeLessThanOrEqual(384 - 18);
  });

  it("digs in just inside the screen's edges in turn, wherever the hero stands", () => {
    const game = gameAt(100);
    expect(burrowSpot(game, 0)).toBe(BURROW.inset);
    expect(burrowSpot(game, 1)).toBe(384 - BURROW.inset);
    const scrolled = gameAt(900, { left: 600, right: 600 + 384 * 3 });
    scrolled.camera.x = 700;
    expect(burrowSpot(scrolled, 0)).toBe(700 + BURROW.inset);
  });
});

describe('a raider still waiting to ambush', () => {
  it('counts until it is in the fight: a shadow until its raider falls, a mound until it bursts', () => {
    const game = gameAt(190);
    game.projectiles.push(
      { kind: 'dropMark', raider: null },
      { kind: 'dropMark', raider: {} },
      { kind: 'mound', eruptAt: 0 },
      { kind: 'mound', eruptAt: 40 },
      { kind: 'knife' },
    );
    expect(pendingAmbushes(game)).toBe(2);
  });
});
