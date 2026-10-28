import { describe, expect, it } from 'vitest';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { groundAt } from '../../../src/data/missions/terrain.js';
import { VENT } from '../../../src/data/vents.js';

// a crate or a catwalk this close would stand in the column; a drop hammer this close would read
// as one hazard with the vent
const CLEAR = VENT.halfWidth + 14;
const CLEAR_OF_HAMMERS = 160;

const placed = MISSIONS.flatMap((mission) =>
  mission.vents.map((vent) => ({ mission, vent, label: `${mission.name} at ${vent.x}` })),
);

describe('the slag vents in the floors', () => {
  it('are in the iron works', () => {
    const roads = new Set(placed.map(({ mission }) => mission.name));

    expect([...roads]).toEqual(['Iron Works']);
  });

  it('each lie in level floor inside a fight, clear of crates, catwalks and hammers', () => {
    for (const { mission, vent, label } of placed) {
      const heights = new Set();
      for (let x = vent.x - CLEAR; x <= vent.x + CLEAR; x++) {
        heights.add(groundAt(mission.terrain, x));
      }

      const zone = mission.zones.find((item) => vent.x > item.left && vent.x < item.right);
      const near = (items, reach) => items.filter(({ x }) => Math.abs(x - vent.x) < reach);
      const catwalks = mission.terrain.platforms.filter(
        (platform) => platform.x - CLEAR < vent.x && platform.x + platform.width + CLEAR > vent.x,
      );

      expect(heights, label).toEqual(new Set([vent.y]));
      expect(zone?.boss, label).toBeNull();
      expect(near(mission.crates, CLEAR), label).toEqual([]);
      expect(near(mission.hammers, CLEAR_OF_HAMMERS), label).toEqual([]);
      expect(catwalks, label).toEqual([]);
    }
  });
});
