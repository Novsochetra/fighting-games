import { describe, expect, it } from 'vitest';
import { CAMPFIRE } from '../../../src/data/campfires.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { groundAt } from '../../../src/data/missions/terrain.js';

// a keg this close to a fire would read as one lit by it
const CLEAR_OF_KEGS = 60;
const CLEAR_OF_CRATES = 30;

const placed = MISSIONS.flatMap((mission) =>
  mission.campfires.map((fire) => ({ mission, fire, label: `${mission.name} fire at ${fire.x}` })),
);

describe('the campfires on the roads', () => {
  it('burn in the raider camp, one to each of its fights', () => {
    const camp = MISSIONS.find((mission) => mission.name === 'Raider Camp');

    expect(placed.every(({ mission }) => mission === camp)).toBe(true);
    expect(camp.campfires.length).toBe(camp.zones.filter((zone) => !zone.boss).length);
  });

  it('each burn on level ground inside a fight, clear of kegs, crates and platforms', () => {
    for (const { mission, fire, label } of placed) {
      const heights = new Set();
      for (let x = fire.x - CAMPFIRE.halfWidth - 4; x <= fire.x + CAMPFIRE.halfWidth + 4; x++) {
        heights.add(groundAt(mission.terrain, x));
      }
      const zone = mission.zones.find((item) => fire.x > item.left && fire.x < item.right);
      const near = (items, reach) => items.filter(({ x }) => Math.abs(x - fire.x) < reach);
      const over = mission.terrain.platforms.filter(
        (platform) => platform.x - 16 < fire.x && platform.x + platform.width + 16 > fire.x,
      );

      expect(heights.size, label).toBe(1);
      expect(zone?.boss, label).toBeNull();
      expect(near(mission.kegs, CLEAR_OF_KEGS), label).toEqual([]);
      expect(near(mission.crates, CLEAR_OF_CRATES), label).toEqual([]);
      expect(over, label).toEqual([]);
    }
  });
});
