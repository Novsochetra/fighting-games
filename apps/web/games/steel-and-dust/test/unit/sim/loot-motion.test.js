import { describe, expect, it } from 'vitest';
import { GROUND_Y, VIEW_WIDTH } from '../../../src/config.js';
import { fallAndBounce } from '../../../src/sim/items/loot-motion.js';
import { createLootGame, piece } from '../../support/loot-game.js';
import { buildTerrain } from '../../support/terrain-game.js';

function settle(game, coin, ticks = 300) {
  const bounces = [];
  for (let tick = 0; tick < ticks && !coin.landed; tick++) {
    if (fallAndBounce(coin, game)) {
      bounces.push(tick);
    }
  }
  return bounces;
}

describe('a loot piece falling', () => {
  it('bounces lower each time and comes to rest with its foot on the ground', () => {
    const { game } = createLootGame();
    const coin = piece({ x: 150, y: GROUND_Y - 30, vy: -3, vx: 1 });
    const peaks = [];
    let lowest = coin.y;
    for (let tick = 0; tick < 300 && !coin.landed; tick++) {
      if (fallAndBounce(coin, game)) {
        peaks.push(lowest);
        lowest = GROUND_Y;
      }
      lowest = Math.min(lowest, coin.y);
    }
    expect(coin.landed).toBe(true);
    expect(coin.y).toBe(GROUND_Y);
    expect(coin.vx).toBe(0);
    expect(peaks.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < peaks.length; i++) {
      expect(peaks[i]).toBeGreaterThan(peaks[i - 1]);
    }
  });

  it('stays still once it has landed', () => {
    const { game } = createLootGame();
    const coin = piece({ x: 150, y: GROUND_Y, landed: true });
    expect(fallAndBounce(coin, game)).toBe(false);
    expect(coin).toMatchObject({ x: 150, y: GROUND_Y });
  });

  it('bounces off the edge of the screen instead of leaving it', () => {
    const { game } = createLootGame();
    const coin = piece({ x: VIEW_WIDTH - 6, y: GROUND_Y - 20, vx: 3, vy: -1 });
    settle(game, coin);
    expect(coin.x).toBeLessThan(VIEW_WIDTH - 3);
    expect(coin.x).toBeGreaterThan(VIEW_WIDTH / 2);
  });

  it('lands on a deck it falls onto and rests on its top', () => {
    const { game } = createLootGame();
    game.terrain = buildTerrain({ platforms: [{ at: 100, width: 80, rise: 30, kind: 'planks' }] });
    const deck = game.terrain.platforms[0];
    const coin = piece({ x: deck.x + 40, y: deck.y - 20, vy: -2 });
    settle(game, coin);
    expect(coin.y).toBe(deck.y);
  });

  it('cannot climb a sheer rise it slides into, but drops in front of it', () => {
    const { game } = createLootGame();
    game.terrain = buildTerrain({
      ground: [
        [0, 0],
        [200, 0],
        [200, 30],
        [400, 30],
      ],
    });
    const coin = piece({ x: 190, y: GROUND_Y - 4, vx: 2.5, vy: -1 });
    settle(game, coin);
    expect(coin.x).toBeLessThan(200);
    expect(coin.y).toBe(GROUND_Y);
  });

  it('rolls on along the floor after its last bounce, slowing until it rests', () => {
    const { game } = createLootGame();
    const coin = piece({ x: 100, y: GROUND_Y - 6, vx: 2, vy: 0 });
    const rolled = [];
    for (let tick = 0; tick < 300 && !coin.landed; tick++) {
      fallAndBounce(coin, game);
      if (coin.rolling) {
        rolled.push(coin.x);
      }
    }
    expect(rolled.length).toBeGreaterThan(5);
    expect(rolled.at(-1) - rolled[0]).toBeGreaterThan(5);
    expect(coin).toMatchObject({ landed: true, rolling: false, vx: 0, y: GROUND_Y });
  });

  it('rolls off the end of a deck and drops to the ground below', () => {
    const { game } = createLootGame();
    game.terrain = buildTerrain({ platforms: [{ at: 100, width: 40, rise: 30, kind: 'planks' }] });
    const deck = game.terrain.platforms[0];
    const coin = piece({ x: deck.x + deck.width - 6, y: deck.y, vx: 1.5, rolling: true });
    settle(game, coin);
    expect(coin.x).toBeGreaterThan(deck.x + deck.width);
    expect(coin.y).toBe(GROUND_Y);
  });
});
