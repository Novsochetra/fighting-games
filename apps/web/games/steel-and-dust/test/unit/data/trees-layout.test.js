import { describe, expect, it } from 'vitest';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { groundAt } from '../../../src/data/missions/terrain.js';
import { TREE } from '../../../src/data/trees.js';

// a platform this close would stand in the trunk
const CLEAR_OF_PLATFORMS = TREE.halfWidth + 24;
const FORESTS = ['Pine Ridge', 'Old Grove', 'Bamboo Pass', 'Ember Woods', 'Firefly Hollow'];

const placed = MISSIONS.flatMap((mission) =>
  mission.trees.map((tree) => ({ mission, tree, label: `${mission.name} tree at ${tree.x}` })),
);

describe('the dead trees by the roads', () => {
  it('stand in the forests, one or two to a road', () => {
    const roads = new Set(placed.map(({ mission }) => mission.name));

    expect([...roads]).toEqual(FORESTS);
  });

  it('stand on level ground as long as the trunk either way, so it lies flat wherever it falls', () => {
    for (const { mission, tree, label } of placed) {
      const heights = new Set();
      for (let x = tree.x - TREE.reach - 4; x <= tree.x + TREE.reach + 4; x++) {
        heights.add(groundAt(mission.terrain, x));
      }

      expect(tree.y, label).toBe(groundAt(mission.terrain, tree.x));
      expect(heights.size, label).toBe(1);
    }
  });

  it('stand inside a fight, clear of platforms, crates and kegs', () => {
    for (const { mission, tree, label } of placed) {
      const zone = mission.zones.find((item) => tree.x > item.left && tree.x < item.right);
      const near = (x, reach) => Math.abs(x - tree.x) <= reach;
      const platforms = mission.terrain.platforms.filter(
        (platform) =>
          platform.x - CLEAR_OF_PLATFORMS < tree.x &&
          platform.x + platform.width + CLEAR_OF_PLATFORMS > tree.x,
      );

      expect(zone?.boss, label).toBeNull();
      expect(platforms, label).toEqual([]);
      expect(
        mission.crates.filter((crate) => near(crate.x, TREE.reach)),
        label,
      ).toEqual([]);
      expect(
        mission.kegs.filter((keg) => near(keg.x, TREE.reach)),
        label,
      ).toEqual([]);
    }
  });
});
