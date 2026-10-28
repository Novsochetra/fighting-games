import { describe, expect, it } from 'vitest';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { groundAt } from '../../../src/data/missions/terrain.js';
import { SLAB } from '../../../src/data/slabs.js';

// the floor either side of a slab that a body it gives way under climbs out on
const SOLID = SLAB.halfWidth + SLAB.edgeIn + 4;
// a lintel this close would catch a dive meant for the slab
const CLEAR_OF_PLATFORMS = SLAB.halfWidth + 8;

const placed = MISSIONS.flatMap((mission) =>
  mission.slabs.map((slab) => ({ mission, slab, label: `${mission.name} slab at ${slab.x}` })),
);

const zoneOf = (mission, x) => mission.zones.find((zone) => x > zone.left && x < zone.right);

describe('the cracked slabs in the galleries', () => {
  it("lie in the Bayon's Gallery of the Cham Wars", () => {
    const galleries = new Set(
      placed.map(({ mission, slab }) => `${mission.name}: ${zoneOf(mission, slab.x)?.label}`),
    );

    expect([...galleries]).toEqual(['Bayon: Gallery of the Cham Wars']);
  });

  it('lie flush with level road, with solid floor either side to climb out on', () => {
    for (const { mission, slab, label } of placed) {
      const heights = new Set();
      for (let x = slab.x - SOLID; x <= slab.x + SOLID; x++) {
        heights.add(groundAt(mission.terrain, x));
      }

      expect(slab.y, label).toBe(groundAt(mission.terrain, slab.x));
      expect(heights.size, label).toBe(1);
    }
  });

  it('lie inside a fight, out from under the lintels and clear of crates and each other', () => {
    for (const { mission, slab, label } of placed) {
      const near = (x, reach) => Math.abs(x - slab.x) <= reach;
      const platforms = mission.terrain.platforms.filter(
        (platform) =>
          platform.x - CLEAR_OF_PLATFORMS < slab.x &&
          platform.x + platform.width + CLEAR_OF_PLATFORMS > slab.x,
      );
      const others = mission.slabs.filter((other) => other !== slab);

      expect(zoneOf(mission, slab.x)?.boss, label).toBeNull();
      expect(platforms, label).toEqual([]);
      expect(
        mission.crates.filter((crate) => near(crate.x, SOLID)),
        label,
      ).toEqual([]);
      expect(
        others.filter((other) => near(other.x, SOLID * 2)),
        label,
      ).toEqual([]);
    }
  });
});
