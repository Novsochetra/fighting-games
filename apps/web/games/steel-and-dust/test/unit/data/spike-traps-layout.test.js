import { describe, expect, it } from 'vitest';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { groundAt } from '../../../src/data/missions/terrain.js';
import { SPIKE_TRAP } from '../../../src/data/spike-traps.js';

// from the middle of a row to the far edge of its end tile, and a little road past it
const HALF_ROW = (SPIKE_TRAP.tiles / 2) * SPIKE_TRAP.pitch;
const CLEAR = HALF_ROW + 8;

const placed = MISSIONS.flatMap((mission) =>
  mission.spikeTraps.map((row) => ({ mission, row, label: `${mission.name} at ${row.x}` })),
);

describe('the spike traps on the roads', () => {
  it('lie in the Mirage Temple, a row in three of its fights', () => {
    const roads = new Set(placed.map(({ mission }) => mission.name));
    const zones = new Set(
      placed.map(({ mission, row }) =>
        mission.zones.findIndex((zone) => row.x > zone.left && row.x < zone.right),
      ),
    );

    expect([...roads]).toEqual(['Mirage Temple']);
    expect(zones.size).toBe(3);
  });

  it('each lie in level road inside a fight, so every tile is flush with it', () => {
    for (const { mission, row, label } of placed) {
      const heights = new Set();
      for (let x = row.x - CLEAR; x <= row.x + CLEAR; x++) {
        heights.add(groundAt(mission.terrain, x));
      }
      const zone = mission.zones.find((item) => row.x > item.left && row.x < item.right);

      expect(heights.size, label).toBe(1);
      expect(zone?.boss, label).toBeNull();
      expect(row.x - CLEAR, label).toBeGreaterThan(zone.left);
      expect(row.x + CLEAR, label).toBeLessThan(zone.right);
    }
  });

  it('each lie clear of crates and out from under the slabs', () => {
    for (const { mission, row, label } of placed) {
      const crates = mission.crates.filter(({ x }) => Math.abs(x - row.x) < CLEAR + 12);
      const slabs = mission.terrain.platforms.filter(
        (platform) => platform.x - CLEAR < row.x && platform.x + platform.width + CLEAR > row.x,
      );

      expect(crates, label).toEqual([]);
      expect(slabs, label).toEqual([]);
    }
  });
});
