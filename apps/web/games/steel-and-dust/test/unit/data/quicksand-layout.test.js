import { describe, expect, it } from 'vitest';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { groundAt } from '../../../src/data/missions/terrain.js';
import { QUICKSAND } from '../../../src/data/quicksand.js';

// the patch is drawn a little wider than the sand feet stand in, its rocks round the rim; a crate
// or a platform this close would stand in it or hang over it
const DRAWN = 30;
const CLEAR = DRAWN + 12;

const placed = MISSIONS.flatMap((mission) =>
  mission.quicksand.map((patch) => ({ mission, patch, label: `${mission.name} at ${patch.x}` })),
);

describe('the quicksand on the roads', () => {
  it('lies in Sandstorm Pass, one patch to each of its fights', () => {
    const canyon = MISSIONS.find((mission) => mission.name === 'Sandstorm Pass');

    expect(placed.every(({ mission }) => mission === canyon)).toBe(true);
    expect(canyon.quicksand.length).toBe(canyon.zones.filter((zone) => !zone.boss).length);
  });

  it('holds feet only inside the drawn patch', () => {
    expect(QUICKSAND.halfWidth).toBeLessThan(DRAWN);
  });

  it('each lie on level road inside a fight, clear of crates and platforms', () => {
    for (const { mission, patch, label } of placed) {
      const heights = new Set();
      for (let x = patch.x - CLEAR; x <= patch.x + CLEAR; x++) {
        heights.add(groundAt(mission.terrain, x));
      }

      const zone = mission.zones.find((item) => patch.x > item.left && patch.x < item.right);
      const crates = mission.crates.filter(({ x }) => Math.abs(x - patch.x) < CLEAR);
      const platforms = mission.terrain.platforms.filter(
        (platform) => platform.x - CLEAR < patch.x && platform.x + platform.width + CLEAR > patch.x,
      );

      expect(heights, label).toEqual(new Set([patch.y]));
      expect(zone?.boss, label).toBeNull();
      expect(crates, label).toEqual([]);
      expect(platforms, label).toEqual([]);
    }
  });
});
