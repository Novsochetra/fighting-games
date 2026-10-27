import { describe, expect, it } from 'vitest';
import { KEG } from '../../../src/data/kegs.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { groundAt } from '../../../src/data/missions/terrain.js';

describe('the kegs laid on the roads', () => {
  const placed = MISSIONS.flatMap((mission) => mission.kegs.map((keg) => ({ mission, keg })));

  it('are in the raider camp', () => {
    expect(MISSIONS[3].kegs.length).toBeGreaterThan(0);
  });

  it('each stand on the road, on a flat stretch as wide as the keg', () => {
    for (const { mission, keg } of placed) {
      const under = [];
      for (let x = keg.x - KEG.halfWidth; x <= keg.x + KEG.halfWidth; x++) {
        under.push(groundAt(mission.terrain, x));
      }

      expect(keg.y).toBe(groundAt(mission.terrain, keg.x));
      expect(new Set(under).size).toBe(1);
    }
  });

  it('each stand inside a fight, never on the open road between two', () => {
    for (const { mission, keg } of placed) {
      expect(
        mission.zones.some((zone) => keg.x > zone.left && keg.x < zone.right && !zone.boss),
      ).toBe(true);
    }
  });
});
