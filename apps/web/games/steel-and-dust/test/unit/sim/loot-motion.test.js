import { describe, expect, it } from 'vitest';
import { GROUND_Y, VIEW_WIDTH } from '../../../src/config.js';
import { LOOT_MOTION } from '../../../src/data/loot.js';
import { fallAndBounce, flyToward } from '../../../src/sim/items/loot-motion.js';
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
});

describe('a loot piece flying to the hero', () => {
  it('speeds up toward the target, never past top speed, and arrives', () => {
    const coin = piece({ x: 0, y: 0 });
    const target = { x: 120, y: 40 };
    let arrived = false;
    let lastSpeed = 0;
    for (let tick = 0; tick < 60 && !arrived; tick++) {
      arrived = flyToward(coin, target);
      const speed = Math.hypot(coin.vx, coin.vy);
      expect(speed).toBeGreaterThanOrEqual(lastSpeed - 1e-9);
      expect(speed).toBeLessThanOrEqual(LOOT_MOTION.magnetTopSpeed + 1e-9);
      lastSpeed = speed;
    }
    expect(arrived).toBe(true);
    expect(Math.hypot(coin.x - target.x, coin.y - target.y)).toBeLessThan(
      LOOT_MOTION.magnetTopSpeed,
    );
  });
});
