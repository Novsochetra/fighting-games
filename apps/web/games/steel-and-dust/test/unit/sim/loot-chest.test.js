import { describe, expect, it } from 'vitest';
import { GROUND_Y, VIEW_WIDTH } from '../../../src/config.js';
import { CHEST_FRAMES } from '../../../src/data/loot-sprites.js';
import { CHEST_SCATTER, CHEST_TIMING } from '../../../src/data/loot.js';
import { chestAge, dropChest, updateChests } from '../../../src/sim/items/loot-chest.js';
import { countRandomDraws, createLootGame, soundKeys } from '../../support/loot-game.js';

const CONTENTS = ['coin', 'coin', 'gem', 'apple'];

function chestGame(x = 200) {
  const { game, sounds } = createLootGame();
  dropChest(game, { x, y: GROUND_Y, contents: CONTENTS });
  return { game, sounds, chest: game.chests[0] };
}

function runUntil(game, done, limit = 600) {
  for (let tick = 0; tick < limit && !done(); tick++) {
    updateChests(game);
  }
}

describe('a boss chest', () => {
  it('pops up out of the boss and lands on the road with a thud', () => {
    const { game, sounds, chest } = chestGame();
    expect(chest.y).toBeLessThan(GROUND_Y);
    runUntil(game, () => chest.landedAt !== null);
    expect(chest.y).toBe(GROUND_Y);
    expect(soundKeys(sounds)).toEqual(['chestLand']);
    expect(game.camera.zoom.time).toBeGreaterThan(0);
  });

  it('rattles, bursts open and only then spills what it holds', () => {
    const { game, sounds, chest } = chestGame();
    runUntil(game, () => chestAge(chest) === CHEST_TIMING.openAt - 1);
    expect(game.loot).toEqual([]);
    expect(soundKeys(sounds)).toEqual(['chestLand', 'chestRattle']);
    updateChests(game);
    expect(chest.frame).toBe(CHEST_FRAMES.opening);
    expect(soundKeys(sounds).at(-1)).toBe('chestOpen');
    runUntil(game, () => chest.spilled);
    expect(chest.frame).toBe(CHEST_FRAMES.open);
    expect(game.loot.map((piece) => piece.kind)).toEqual(CONTENTS);
  });

  it('shows the rattle frame on and off while it strains at the lock', () => {
    const { game, chest } = chestGame();
    const frames = new Set();
    runUntil(game, () => chestAge(chest) === CHEST_TIMING.rattleAt);
    for (let tick = CHEST_TIMING.rattleAt; tick < CHEST_TIMING.openAt; tick++) {
      frames.add(chest.frame);
      updateChests(game);
    }
    expect([...frames].sort()).toEqual([CHEST_FRAMES.closed, CHEST_FRAMES.rattle]);
  });

  it('spills its loot once only, then sinks away', () => {
    const { game, chest } = chestGame();
    runUntil(game, () => chest.spilled);
    const spilled = game.loot.length;
    runUntil(game, () => game.chests.length === 0);
    expect(game.chests).toEqual([]);
    expect(game.loot.length).toBe(spilled);
  });

  it('flings its loot out to both sides, some far and some near', () => {
    const { game, chest } = chestGame();
    chest.contents = Array.from({ length: 20 }, () => 'coin');
    runUntil(game, () => chest.spilled);
    const speeds = game.loot.map((piece) => piece.vx);
    expect(speeds.filter((vx) => vx < 0)).toHaveLength(10);
    expect(speeds.filter((vx) => vx > 0)).toHaveLength(10);
    const sizes = speeds.map(Math.abs);
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(CHEST_SCATTER.speed[0]);
    expect(Math.max(...sizes)).toBeLessThanOrEqual(CHEST_SCATTER.speed[1]);
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeGreaterThan(2);
    expect(game.loot.every((piece) => piece.vy < 0)).toBe(true);
  });

  it('opens on screen even when the boss fell against its edge', () => {
    const { game, chest } = chestGame(VIEW_WIDTH + 40);
    expect(chest.x).toBeLessThan(VIEW_WIDTH - 10);
    expect(game.chests).toHaveLength(1);
  });

  it('never takes a draw from Math.random from drop to spill', () => {
    const { game, chest } = chestGame();
    expect(countRandomDraws(() => runUntil(game, () => chest.spilled))).toBe(0);
  });
});
