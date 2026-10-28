import { describe, expect, it } from 'vitest';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { groundAt } from '../../../src/data/missions/terrain.js';
import { NEST } from '../../../src/data/nests.js';
import { TREE } from '../../../src/data/trees.js';

// the road under a nest is level this far either way, where the launched raider stands and the
// nest breaks open
const LEVEL = NEST.halfWidth + 24;
// a hero on a deck this close could reach the nest with an ordinary blow
const CLEAR_OF_PLATFORMS = NEST.halfWidth + 30;
// the swarm breaks out well inside the fight, not against its walls
const CLEAR_OF_WALLS = 60;
const FORESTS = ['Pine Ridge', 'Old Grove', 'Bamboo Pass', 'Ember Woods', 'Firefly Hollow'];

const placed = MISSIONS.flatMap((mission) =>
  mission.nests.map((nest) => ({ mission, nest, label: `${mission.name} nest at ${nest.x}` })),
);

const near = (nest, x, reach) => Math.abs(x - nest.x) <= reach;

describe('the hornet nests over the roads', () => {
  it('hang in the forests, one or two to a road', () => {
    const roads = placed.map(({ mission }) => mission.name);
    const counts = FORESTS.map((name) => roads.filter((road) => road === name).length);

    expect([...new Set(roads)]).toEqual(FORESTS);
    expect(counts.every((count) => count >= 1 && count <= 2)).toBe(true);
  });

  it('hang over level road', () => {
    for (const { mission, nest, label } of placed) {
      const heights = new Set();
      for (let x = nest.x - LEVEL; x <= nest.x + LEVEL; x++) {
        heights.add(groundAt(mission.terrain, x));
      }

      expect(nest.y, label).toBe(groundAt(mission.terrain, nest.x));
      expect(heights.size, label).toBe(1);
    }
  });

  it('hang well inside a fight, clear of its walls', () => {
    for (const { mission, nest, label } of placed) {
      const zone = mission.zones.find((item) => nest.x > item.left && nest.x < item.right);

      expect(zone?.boss, label).toBeNull();
      expect(nest.x - zone.left, label).toBeGreaterThanOrEqual(CLEAR_OF_WALLS);
      expect(zone.right - nest.x, label).toBeGreaterThanOrEqual(CLEAR_OF_WALLS);
    }
  });

  it('hang clear of where a dead tree falls either way, of decks, crates and kegs', () => {
    for (const { mission, nest, label } of placed) {
      const platforms = mission.terrain.platforms.filter(
        (platform) =>
          platform.x - CLEAR_OF_PLATFORMS < nest.x &&
          platform.x + platform.width + CLEAR_OF_PLATFORMS > nest.x,
      );
      const trees = mission.trees.filter((tree) => near(nest, tree.x, TREE.reach + NEST.halfWidth));
      const crates = mission.crates.filter((crate) => near(nest, crate.x, LEVEL));
      const kegs = mission.kegs.filter((keg) => near(nest, keg.x, LEVEL));

      expect(trees, label).toEqual([]);
      expect(platforms, label).toEqual([]);
      expect(crates, label).toEqual([]);
      expect(kegs, label).toEqual([]);
    }
  });
});
