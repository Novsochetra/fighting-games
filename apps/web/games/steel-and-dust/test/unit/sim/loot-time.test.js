import { describe, expect, it } from 'vitest';
import { LOOT_TIME } from '../../../src/data/loot.js';
import { knockOut } from '../../../src/sim/combat/knock-out.js';
import { isFightOver, updateLootTime } from '../../../src/sim/stage/loot-time.js';
import { createLootGame, piece, spawnEnemy } from '../../support/loot-game.js';

function felledBossGame() {
  const { game, sounds } = createLootGame();
  const boss = spawnEnemy(game, 'khan', game.player.x + 90);
  game.boss = boss;
  return { game, sounds, boss };
}

// the loot time alone, from its first tick, with whatever lies on the road
function lootTimeGame({ loot = [], chests = [] }) {
  const { game } = createLootGame();
  Object.assign(game, { lootTime: 1, loot, chests });
  return game;
}

function ticksToClear(game, limit = LOOT_TIME.limit + 10) {
  for (let tick = 1; tick <= limit; tick++) {
    updateLootTime(game);
    if (game.clearTime) {
      return tick;
    }
  }
  return null;
}

describe('the mission boss falling', () => {
  it('starts the loot time, not the clear, and the fight is over', () => {
    const { game, boss } = felledBossGame();
    knockOut(game, boss, 1);
    expect(game.lootTime).toBe(1);
    expect(game.clearTime).toBe(0);
    expect(isFightOver(game)).toBe(true);
    expect(game.banner).toMatchObject({ text: 'Gravel Khan down', sub: 'Grab the loot' });
  });

  it('fells every raider still standing and calls in no more', () => {
    const { game, boss } = felledBossGame();
    const raider = spawnEnemy(game, 'grunt', game.player.x - 40);
    game.stage.spawnQueue = [{ kind: 'grunt', side: 1, delay: 5 }];
    knockOut(game, boss, 1);
    expect(raider.state).toBe('ko');
    expect(game.stage.spawnQueue).toEqual([]);
  });

  it('starts the loot time only once', () => {
    const { game, boss } = felledBossGame();
    game.lootTime = 40;
    knockOut(game, boss, 1);
    expect(game.lootTime).toBe(40);
  });
});

describe('the loot time', () => {
  it('ends a short beat after the road is bare, and the clear starts', () => {
    const game = lootTimeGame({});
    expect(ticksToClear(game)).toBe(LOOT_TIME.settle);
    expect(game.lootTime).toBe(0);
    expect(game.banner.text).toBe('Mission complete');
  });

  it('runs on while a piece is lying in reach, up to its limit', () => {
    const game = lootTimeGame({ loot: [piece({ x: 200 })] });
    expect(ticksToClear(game)).toBe(LOOT_TIME.limit - 1);
    expect(game.loot).toEqual([]);
  });

  it('waits for a chest still shut, then drops it with the road', () => {
    const game = lootTimeGame({ chests: [{ spilled: false }, { spilled: true }] });
    expect(ticksToClear(game)).toBe(LOOT_TIME.limit - 1);
    expect(game.chests).toEqual([{ spilled: true }]);
  });

  it('pays no mind to pieces left behind off the screen', () => {
    const game = lootTimeGame({ loot: [piece({ x: -400 })] });
    expect(ticksToClear(game)).toBe(LOOT_TIME.settle);
  });

  it('holds still while the continue menu is up', () => {
    const game = lootTimeGame({});
    game.mode = 'over';
    updateLootTime(game);
    expect(game.lootTime).toBe(1);
  });

  it('does nothing in the fight itself', () => {
    const { game } = createLootGame();
    updateLootTime(game);
    expect(game.lootTime).toBe(0);
    expect(isFightOver(game)).toBe(false);
  });
});
