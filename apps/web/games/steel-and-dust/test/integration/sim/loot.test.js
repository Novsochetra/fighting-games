import { describe, expect, it } from 'vitest';
import { CHEST_DROP, MAX_LOOT } from '../../../src/data/loot.js';
import { knockOut } from '../../../src/sim/combat/knock-out.js';
import { updateLoot } from '../../../src/sim/items/loot.js';
import { CLEAR_TICKS } from '../../../src/sim/stage/stage-clear.js';
import { createLootGame, soundKeys, spawnEnemy } from '../../support/loot-game.js';
import { runTicks } from '../../support/test-game.js';

function missionBossGame() {
  const { game, sounds } = createLootGame();
  runTicks(game, 2);
  const boss = spawnEnemy(game, 'khan', game.player.x + 90);
  game.boss = boss;
  return { game, sounds, boss };
}

describe('loot in play', () => {
  it('a raider the hero knocks down beside them pays out in coins within a second or so', () => {
    const { game, sounds } = createLootGame();
    runTicks(game, 2);
    const raider = spawnEnemy(game, 'grunt', game.player.x + 14);
    knockOut(game, raider, 1);
    expect(game.loot.length).toBeGreaterThanOrEqual(2);
    runTicks(game, 90);
    expect(game.loot).toEqual([]);
    expect(game.coins).toBeGreaterThanOrEqual(2);
    expect(soundKeys(sounds)).toContain('coin');
  });

  it("the mission boss's chest opens over the clear screen and all of it reaches the purse", () => {
    const { game, sounds, boss } = missionBossGame();
    knockOut(game, boss, 1);
    expect(game.clearTime).toBeGreaterThan(0);
    const { coins, gems } = CHEST_DROP.missionBoss;
    runTicks(game, CLEAR_TICKS - 2);
    expect(game.coins).toBe(coins + gems * 10);
    expect(game.loot).toEqual([]);
    for (const key of ['chestLand', 'chestRattle', 'chestOpen', 'coin', 'gem']) {
      expect(soundKeys(sounds)).toContain(key);
    }
  });

  it('carries the purse into the next mission, its coins counted in the best score', () => {
    const { game, boss } = missionBossGame();
    knockOut(game, boss, 1);
    // the boss's fall plays in slow motion, one step in three, before the clear screen runs on
    runTicks(game, CLEAR_TICKS + 60);
    expect(game.missionIndex).toBe(1);
    expect(game.coins).toBeGreaterThan(0);
    expect(game.records.bestScore).toBe(game.score);
  });

  it("banks a chest still shut when the road ends, so the boss's reward is never lost", () => {
    const { game, boss } = missionBossGame();
    knockOut(game, boss, 1);
    Object.assign(game, { clearTime: CLEAR_TICKS, slowMotion: 0 });
    runTicks(game, 2);
    const { coins, gems } = CHEST_DROP.missionBoss;
    expect(game.missionIndex).toBe(1);
    expect(game.coins).toBe(coins + gems * 10);
  });

  it('a stage clear that fells a crowd keeps the road to its piece limit and pays for the rest', () => {
    const { game } = createLootGame();
    runTicks(game, 2);
    const raiders = Array.from({ length: 60 }, (_, i) => spawnEnemy(game, 'grunt', 40 + i * 5));
    raiders.forEach((raider) => knockOut(game, raider, 1));
    expect(game.loot.length).toBe(MAX_LOOT);
    const paidAlready = game.coins;
    game.clearTime = 1;
    runTicks(game, 120);
    expect(game.loot).toEqual([]);
    expect(game.coins).toBeGreaterThan(paidAlready + MAX_LOOT / 2);
  });

  it('moves a full road of loot well inside a tick budget', () => {
    const { game } = createLootGame();
    runTicks(game, 2);
    for (let i = 0; i < 40; i++) {
      knockOut(game, spawnEnemy(game, 'grunt', 30 + i * 8), 1);
    }
    game.player.x = -500;
    const ticks = 600;
    const started = performance.now();
    for (let tick = 0; tick < ticks; tick++) {
      updateLoot(game);
    }
    const perTick = (performance.now() - started) / ticks;
    // a tick has 16.7ms; loot is a sliver of it even with the road full
    expect(perTick).toBeLessThan(0.5);
  });
});
