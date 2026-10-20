import { describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { FLAT_TERRAIN } from '../../../src/data/missions/terrain.js';
import {
  STEP_UP,
  floorBelow,
  groundAt,
  isWall,
  platformUnder,
} from '../../../src/sim/stage/terrain.js';

function hill() {
  const heights = new Int16Array(401).fill(GROUND_Y);
  for (let x = 100; x <= 200; x++) {
    heights[x] = GROUND_Y - 30;
  }
  return {
    heights,
    platforms: [{ x: 250, y: GROUND_Y - 40, width: 60, kind: 'log' }],
  };
}

describe('the ground under a spot', () => {
  it('is exactly the old road everywhere on a flat mission', () => {
    for (const x of [-50, 0, 123.7, 9999]) {
      expect(groundAt(FLAT_TERRAIN, x)).toBe(GROUND_Y);
      expect(floorBelow(FLAT_TERRAIN, x, 20)).toBe(GROUND_Y);
    }
  });

  it('reads the height of the column a spot is in, and holds the end heights past the road', () => {
    const terrain = hill();
    expect(groundAt(terrain, 99.9)).toBe(GROUND_Y);
    expect(groundAt(terrain, 100.2)).toBe(GROUND_Y - 30);
    expect(groundAt(terrain, -10)).toBe(GROUND_Y);
    expect(groundAt(terrain, 5000)).toBe(GROUND_Y);
  });
});

describe('the floor below something', () => {
  it('is a platform only for what is at or above its top', () => {
    const terrain = hill();
    expect(floorBelow(terrain, 280, GROUND_Y - 60)).toBe(GROUND_Y - 40);
    expect(floorBelow(terrain, 280, GROUND_Y - 40)).toBe(GROUND_Y - 40);
    expect(floorBelow(terrain, 280, GROUND_Y - 39)).toBe(GROUND_Y);
    expect(floorBelow(terrain, 320, GROUND_Y - 60)).toBe(GROUND_Y);
  });

  it('finds the platform a fighter stands on', () => {
    const terrain = hill();
    expect(platformUnder(terrain, 260, GROUND_Y - 40)).toBe(terrain.platforms[0]);
    expect(platformUnder(terrain, 260, GROUND_Y)).toBeNull();
  });
});

describe('walls', () => {
  it('are rises taller than a step', () => {
    const terrain = hill();
    expect(isWall(terrain, 150, GROUND_Y)).toBe(true);
    expect(isWall(terrain, 150, GROUND_Y - 30 + STEP_UP)).toBe(false);
    expect(isWall(terrain, 50, GROUND_Y - 30)).toBe(false);
    expect(isWall(FLAT_TERRAIN, 150, GROUND_Y)).toBe(false);
  });
});
