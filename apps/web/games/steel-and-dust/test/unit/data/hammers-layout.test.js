import { describe, expect, it } from 'vitest';
import { HAMMER } from '../../../src/data/hammers.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { groundAt } from '../../../src/data/missions/terrain.js';

// a crate or a catwalk this close would stand in the hammer's way
const CLEAR = HAMMER.halfWidth + 12;

const placed = MISSIONS.flatMap((mission) =>
  mission.hammers.map((hammer) => ({ mission, hammer, label: `${mission.name} at ${hammer.x}` })),
);

describe('the drop hammers on the roads', () => {
  it('stand in the iron works', () => {
    const roads = new Set(placed.map(({ mission }) => mission.name));

    expect([...roads]).toEqual(['Iron Works']);
  });

  it('each strike level ground inside a fight, clear of crates and catwalks', () => {
    for (const { mission, hammer, label } of placed) {
      const heights = new Set();
      for (let x = hammer.x - CLEAR; x <= hammer.x + CLEAR; x++) {
        heights.add(groundAt(mission.terrain, x));
      }
      const zone = mission.zones.find((item) => hammer.x > item.left && hammer.x < item.right);
      const crates = mission.crates.filter(({ x }) => Math.abs(x - hammer.x) < CLEAR);
      const catwalks = mission.terrain.platforms.filter(
        (platform) =>
          platform.x - CLEAR < hammer.x && platform.x + platform.width + CLEAR > hammer.x,
      );

      expect(heights.size, label).toBe(1);
      expect(zone?.boss, label).toBeNull();
      expect(crates, label).toEqual([]);
      expect(catwalks, label).toEqual([]);
    }
  });
});
