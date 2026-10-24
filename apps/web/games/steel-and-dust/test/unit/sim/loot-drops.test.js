import { describe, expect, it } from 'vitest';
import { CHEST_DROP, LOOT_VALUES, MAX_LOOT, RAIDER_DROP } from '../../../src/data/loot.js';
import { chestContents, dropLoot } from '../../../src/sim/items/loot-drops.js';
import { spawnPiece } from '../../../src/sim/items/loot-pieces.js';
import {
  countRandomDraws,
  createLootGame,
  piece as lootPiece,
  spawnEnemy,
} from '../../support/loot-game.js';

function kindsOf(game) {
  return game.loot.map((piece) => piece.kind);
}

function count(kinds, kind) {
  return kinds.filter((each) => each === kind).length;
}

// a raider that pays, found by knocking down raiders until one does
function payingDrop(game, raider) {
  for (let i = 0; i < 100 && !game.loot.some((piece) => piece.kind === 'coin'); i++) {
    game.loot = [];
    dropLoot(game, raider);
  }
  return kindsOf(game);
}

describe('loot a fallen raider drops', () => {
  it('spills one to three coins from its middle when it pays, flying up and out', () => {
    const { game } = createLootGame();
    const raider = spawnEnemy(game, 'grunt', 160);
    const coins = count(payingDrop(game, raider), 'coin');
    expect(coins).toBeGreaterThanOrEqual(RAIDER_DROP.coins[0]);
    expect(coins).toBeLessThanOrEqual(RAIDER_DROP.coins[1]);
    for (const piece of game.loot) {
      expect(piece.x).toBe(raider.x);
      expect(piece.y).toBeLessThan(raider.y);
      expect(piece.vy).toBeLessThan(0);
    }
  });

  it('pays only now and then, with gems and apples about as often as the table says', () => {
    const { game } = createLootGame();
    const raider = spawnEnemy(game, 'grunt', 160);
    const drops = 4000;
    const tally = { paid: 0, gems: 0, apples: 0 };
    for (let i = 0; i < drops; i++) {
      game.loot = [];
      dropLoot(game, raider);
      const kinds = kindsOf(game);
      tally.paid += kinds.includes('coin') ? 1 : 0;
      tally.gems += count(kinds, 'gem');
      tally.apples += count(kinds, 'apple');
    }
    expect(tally.paid / drops).toBeCloseTo(RAIDER_DROP.chance, 1);
    expect(tally.gems / drops).toBeCloseTo(RAIDER_DROP.chance * RAIDER_DROP.gemChance, 1);
    expect(tally.apples / drops).toBeCloseTo(RAIDER_DROP.appleChance, 1);
  });

  it('leaves most raiders with nothing to drop', () => {
    const { game } = createLootGame();
    const raider = spawnEnemy(game, 'grunt', 160);
    let empty = 0;
    for (let i = 0; i < 200; i++) {
      game.loot = [];
      dropLoot(game, raider);
      empty += game.loot.length === 0 ? 1 : 0;
    }
    expect(empty).toBeGreaterThan(80);
  });

  it('scatters the same loot on the same road every time it is played', () => {
    const first = createLootGame().game;
    const second = createLootGame().game;
    for (const game of [first, second]) {
      for (let i = 0; i < 12; i++) {
        dropLoot(game, spawnEnemy(game, 'grunt', 120 + i * 10));
      }
    }
    expect(first.loot).toEqual(second.loot);
  });

  it('never takes a draw from Math.random, which steers the raiders', () => {
    const { game } = createLootGame();
    const raider = spawnEnemy(game, 'grunt', 160);
    expect(countRandomDraws(() => dropLoot(game, raider))).toBe(0);
  });
});

describe('a road full of loot', () => {
  function fullRoad() {
    const { game } = createLootGame();
    game.loot = Array.from({ length: MAX_LOOT }, () => lootPiece({}));
    return game;
  }

  it('pays a coin or gem past the limit straight into the purse, and counts it', () => {
    const game = fullRoad();
    spawnPiece(game, { kind: 'gem', x: 100, y: 100, vx: 0, vy: 0 });
    expect(game.loot).toHaveLength(MAX_LOOT);
    expect(game.coins).toBe(LOOT_VALUES.gem.coins);
    expect(game.score).toBe(LOOT_VALUES.gem.score);
    expect(game.missionLoot.gem).toBe(1);
  });

  it('drops an apple past the limit, uneaten and uncounted', () => {
    const game = fullRoad();
    spawnPiece(game, { kind: 'apple', x: 100, y: 100, vx: 0, vy: 0 });
    expect(game.loot).toHaveLength(MAX_LOOT);
    expect(game.missionLoot.apple).toBe(0);
  });
});

describe('loot a fallen boss drops', () => {
  it("leaves the mission boss's big chest and spills nothing loose", () => {
    const { game } = createLootGame();
    const boss = spawnEnemy(game, 'khan', 200);
    dropLoot(game, boss);
    expect(game.loot).toEqual([]);
    expect(game.chests).toHaveLength(1);
    expect(game.chests[0].contents).toEqual(chestContents(CHEST_DROP.missionBoss));
  });

  it('leaves a smaller chest for a boss met on the way', () => {
    const { game } = createLootGame();
    dropLoot(game, spawnEnemy(game, 'brute', 200));
    expect(game.chests[0].contents).toEqual(chestContents(CHEST_DROP.midBoss));
  });

  it('fills a chest with coins, then gems, then apples', () => {
    expect(chestContents({ coins: 2, gems: 1, apples: 1 })).toEqual([
      'coin',
      'coin',
      'gem',
      'apple',
    ]);
  });
});
