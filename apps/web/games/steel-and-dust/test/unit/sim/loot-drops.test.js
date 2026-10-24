import { describe, expect, it } from 'vitest';
import { CHEST_DROP, MAX_LOOT, RAIDER_DROP } from '../../../src/data/loot.js';
import { bankLeftovers, chestContents, dropLoot } from '../../../src/sim/items/loot-drops.js';
import { countRandomDraws, createLootGame, spawnEnemy } from '../../support/loot-game.js';

function kindsOf(game) {
  return game.loot.map((piece) => piece.kind);
}

function count(kinds, kind) {
  return kinds.filter((each) => each === kind).length;
}

describe('loot a fallen raider drops', () => {
  it('spills two to four coins from its middle, flying up and out', () => {
    const { game } = createLootGame();
    const raider = spawnEnemy(game, 'grunt', 160);
    dropLoot(game, raider);
    const coins = count(kindsOf(game), 'coin');
    expect(coins).toBeGreaterThanOrEqual(RAIDER_DROP.coins[0]);
    expect(coins).toBeLessThanOrEqual(RAIDER_DROP.coins[1]);
    for (const piece of game.loot) {
      expect(piece.x).toBe(raider.x);
      expect(piece.y).toBeLessThan(raider.y);
      expect(piece.vy).toBeLessThan(0);
    }
  });

  it('drops gems and apples now and then, about as often as the table says', () => {
    const { game } = createLootGame();
    const raider = spawnEnemy(game, 'grunt', 160);
    const drops = 2000;
    let gems = 0;
    let apples = 0;
    for (let i = 0; i < drops; i++) {
      game.loot = [];
      dropLoot(game, raider);
      gems += count(kindsOf(game), 'gem');
      apples += count(kindsOf(game), 'apple');
    }
    expect(gems / drops).toBeCloseTo(RAIDER_DROP.gemChance, 1);
    expect(apples / drops).toBeCloseTo(RAIDER_DROP.appleChance, 1);
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

  it('pays straight into the purse once the road holds as many pieces as it may', () => {
    const { game } = createLootGame();
    const raider = spawnEnemy(game, 'grunt', 160);
    while (game.loot.length < MAX_LOOT) {
      dropLoot(game, raider);
    }
    game.loot.length = MAX_LOOT;
    const before = { coins: game.coins, score: game.score };
    dropLoot(game, raider);
    expect(game.loot).toHaveLength(MAX_LOOT);
    expect(game.coins).toBeGreaterThan(before.coins);
    expect(game.score).toBeGreaterThan(before.score);
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

describe('banking what is left when a road ends', () => {
  it('pays for loose coins, gems and an unopened chest, but not apples, and clears the road', () => {
    const { game } = createLootGame();
    dropLoot(game, spawnEnemy(game, 'khan', 200));
    game.loot = [
      { kind: 'coin', taken: false },
      { kind: 'gem', taken: false },
      { kind: 'apple', taken: false },
      { kind: 'coin', taken: true },
    ];
    const { coins, gems } = CHEST_DROP.missionBoss;
    bankLeftovers(game);
    expect(game.coins).toBe(1 + 10 + coins + gems * 10);
    expect(game.score).toBe(10 + 100 + coins * 10 + gems * 100);
    expect(game.loot).toEqual([]);
    expect(game.chests).toEqual([]);
  });

  it('does not pay twice for a chest that has already spilled', () => {
    const { game } = createLootGame();
    dropLoot(game, spawnEnemy(game, 'khan', 200));
    game.chests[0].spilled = true;
    bankLeftovers(game);
    expect(game.coins).toBe(0);
  });
});
