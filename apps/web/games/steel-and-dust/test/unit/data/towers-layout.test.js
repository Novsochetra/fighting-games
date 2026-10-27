import { describe, expect, it } from 'vitest';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { groundAt } from '../../../src/data/missions/terrain.js';
import { STONES } from '../../../src/data/towers.js';

// half the drawn base the tower stands on, and the room a lintel or a crate keeps from it
const BASE = 26;
const CLEAR = BASE + 16;

const placed = MISSIONS.flatMap((mission) =>
  mission.towers.map((tower) => ({ mission, tower, label: `${mission.name} tower at ${tower.x}` })),
);

const zoneOf = (mission, x) => mission.zones.find((zone) => x > zone.left && x < zone.right);

describe('the face towers on the roads', () => {
  it("stand in the Bayon's fights, the most in the Forest of Faces", () => {
    const zones = placed.map(
      ({ mission, tower }) => `${mission.name}: ${zoneOf(mission, tower.x)?.label}`,
    );

    expect(new Set(zones)).toEqual(
      new Set(['Bayon: Terrace of the Elephants', 'Bayon: Forest of Faces']),
    );
  });

  it('stand on level road, their base flat on it', () => {
    for (const { mission, tower, label } of placed) {
      const heights = new Set();
      for (let x = tower.x - BASE; x <= tower.x + BASE; x++) {
        heights.add(groundAt(mission.terrain, x));
      }

      expect(tower.y, label).toBe(groundAt(mission.terrain, tower.x));
      expect(heights.size, label).toBe(1);
    }
  });

  it('drop their stones inside a fight, and stand clear of lintels and crates', () => {
    for (const { mission, tower, label } of placed) {
      const zone = zoneOf(mission, tower.x);
      const lintels = mission.terrain.platforms.filter(
        (platform) => platform.x - CLEAR < tower.x && platform.x + platform.width + CLEAR > tower.x,
      );

      expect(zone?.boss, label).toBeNull();
      expect(tower.x - STONES.spread, label).toBeGreaterThan(zone.left);
      expect(tower.x + STONES.spread, label).toBeLessThan(zone.right);
      expect(lintels, label).toEqual([]);
      expect(
        mission.crates.filter((crate) => Math.abs(crate.x - tower.x) < CLEAR),
        label,
      ).toEqual([]);
    }
  });
});
