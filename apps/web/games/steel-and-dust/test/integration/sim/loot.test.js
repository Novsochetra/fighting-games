import { describe, expect, it } from 'vitest';
import { VIEW_WIDTH } from '../../../src/config.js';
import { CHEST_DROP, LOOT_TIME, MAX_LOOT } from '../../../src/data/loot.js';
import { purseTake } from '../../../src/data/mission-summary.js';
import { knockOut } from '../../../src/sim/combat/knock-out.js';
import { updateLoot } from '../../../src/sim/items/loot.js';
import { CLEAR_TICKS } from '../../../src/sim/stage/stage-clear.js';
import { createLootGame, soundKeys, spawnEnemy } from '../../support/loot-game.js';
import { press, release, runTicks } from '../../support/test-game.js';

// the boss's screen locked, as the last wave of a boss zone locks it
function missionBossGame() {
  const { game, sounds } = createLootGame();
  runTicks(game, 2);
  const left = Math.round(game.camera.x);
  game.arena = { left, right: left + VIEW_WIDTH };
  const boss = spawnEnemy(game, 'khan', game.player.x + 90);
  game.boss = boss;
  return { game, sounds, boss };
}

// raiders knocked down well ahead of the hero until one pays out
function payingRaider(game) {
  for (let i = 0; i < 30 && !game.loot.length; i++) {
    knockOut(game, spawnEnemy(game, 'grunt', game.player.x + 120), 1);
  }
}

function walk(game, direction, ticks) {
  press(game, direction);
  runTicks(game, ticks);
  release(game, direction);
}

function nearestPiece(game) {
  const { left, right } = game.arena;
  const inReach = game.loot.filter((piece) => piece.x > left && piece.x < right);
  const away = (piece) => Math.abs(piece.x - game.player.x);
  inReach.sort((first, second) => away(first) - away(second));
  return inReach[0];
}

// the hero runs at the nearest piece, as a player would, until the loot time is over
function fetchLoot(game) {
  for (let tick = 0; tick < LOOT_TIME.limit && game.lootTime; tick++) {
    const piece = nearestPiece(game);
    const dx = piece ? piece.x - game.player.x : 0;
    game.input.held.right = dx > 2;
    game.input.held.left = dx < -2;
    runTicks(game, 1);
  }
  release(game, 'right');
  release(game, 'left');
}

const { coins, gems, apples } = CHEST_DROP.missionBoss;
const chestTotal = () => purseTake({ coin: coins, gem: gems, apple: apples });

describe('loot in play', () => {
  it("a raider's coins lie where they land until the hero walks over them", () => {
    const { game, sounds } = createLootGame();
    runTicks(game, 2);
    payingRaider(game);
    const dropped = game.loot.length;
    expect(dropped).toBeGreaterThan(0);
    runTicks(game, 90);
    expect(game.loot).toHaveLength(dropped);
    expect(game.coins).toBe(0);
    walk(game, 'right', 100);
    expect(game.coins).toBeGreaterThan(0);
    expect(soundKeys(sounds)).toContain('coin');
  });

  it('a stage clear that fells a crowd keeps the road to its piece limit and pays for the rest', () => {
    const { game } = createLootGame();
    runTicks(game, 2);
    for (let i = 0; i < 160; i++) {
      knockOut(game, spawnEnemy(game, 'grunt', 40 + (i % 60) * 5), 1);
    }
    expect(game.loot.length).toBe(MAX_LOOT);
    expect(game.coins).toBeGreaterThan(0);
  });

  it('moves a full road of loot well inside a tick budget', () => {
    const { game } = createLootGame();
    runTicks(game, 2);
    for (let i = 0; i < 160; i++) {
      knockOut(game, spawnEnemy(game, 'grunt', 30 + (i % 40) * 8), 1);
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

describe("the mission boss's loot", () => {
  it('opens the chest over the loot time, with the hero free to walk and nothing summed up yet', () => {
    const { game, sounds, boss } = missionBossGame();
    knockOut(game, boss, 1);
    runTicks(game, 200);
    expect(game.clearTime).toBe(0);
    expect(game.lootTime).toBeGreaterThan(0);
    expect(game.chests[0].spilled).toBe(true);
    for (const key of ['chestLand', 'chestRattle', 'chestOpen']) {
      expect(soundKeys(sounds)).toContain(key);
    }
    const x = game.player.x;
    walk(game, 'right', 20);
    expect(game.player.x).toBeGreaterThan(x);
    expect(game.player.state).not.toBe('win');
  });

  it('scatters the chest across the arena, bouncing and rolling before it comes to rest', () => {
    const { game, boss } = missionBossGame();
    knockOut(game, boss, 1);
    const chestX = game.chests[0].x;
    let rolled = false;
    for (
      let tick = 0;
      tick < 400 && !(game.loot.length && game.loot.every((piece) => piece.landed));
      tick++
    ) {
      runTicks(game, 1);
      rolled ||= game.loot.some((piece) => piece.rolling);
    }
    const xs = game.loot.map((piece) => piece.x);
    expect(rolled).toBe(true);
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(VIEW_WIDTH / 2);
    expect(xs.some((x) => x < chestX - 60)).toBe(true);
    expect(xs.some((x) => x > chestX + 60)).toBe(true);
  });

  it('every piece the hero fetches reaches the purse, and the clear comes once the road is bare', () => {
    const { game, boss } = missionBossGame();
    knockOut(game, boss, 1);
    fetchLoot(game);
    expect(game.loot).toEqual([]);
    expect(game.clearTime).toBeGreaterThan(0);
    expect(game.coins).toBe(purseTake(game.missionLoot));
    expect(game.missionLoot.coin).toBeGreaterThan(coins / 2);
    expect(game.banner.text).toBe('Mission complete');
  });

  it('what the hero leaves lying is lost when the loot time runs out', () => {
    const { game, boss } = missionBossGame();
    game.player.x -= 60;
    knockOut(game, boss, 1);
    runTicks(game, LOOT_TIME.limit + 60);
    expect(game.clearTime).toBeGreaterThan(0);
    expect(game.loot).toEqual([]);
    expect(game.coins).toBeLessThan(chestTotal());
  });

  it('carries the purse into the next mission, its coins counted in the best score', () => {
    const { game, boss } = missionBossGame();
    knockOut(game, boss, 1);
    fetchLoot(game);
    const purse = game.coins;
    runTicks(game, CLEAR_TICKS + 10);
    expect(game.missionIndex).toBe(1);
    expect(purse).toBeGreaterThan(0);
    expect(game.coins).toBe(purse);
    expect(game.missionLoot).toEqual({ coin: 0, gem: 0, apple: 0 });
    expect(game.records.bestScore).toBe(game.score);
  });
});
