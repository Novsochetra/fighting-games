import { describe, expect, it } from 'vitest';
import { VIEW_WIDTH } from '../../../src/config.js';
import { HAMMER } from '../../../src/data/hammers.js';
import { beltLength, mouthOf } from '../../../src/data/conveyors.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { groundAt } from '../../../src/data/missions/terrain.js';

// the belt's drive end reaches a little past where it carries from, and the furnace stands this
// far past the mouth; a crate, a catwalk or a hammer's blow this close would stand in its way
const DRIVE_END = 8;
const FURNACE = 32;
const CLEAR = 16;

const placed = MISSIONS.flatMap((mission) =>
  mission.conveyors.map((belt) => ({
    mission,
    belt,
    label: `${mission.name} belt at ${belt.from}`,
  })),
);

// the whole of it as drawn: the drive end, the belt and the furnace past its mouth
function footprint(belt) {
  const furnaceSide = mouthOf(belt) + belt.direction * FURNACE;
  const driveSide = mouthOf(belt) - belt.direction * (beltLength(belt.segments) + DRIVE_END);

  return [Math.min(furnaceSide, driveSide), Math.max(furnaceSide, driveSide)];
}

const near = (items, [left, right]) =>
  items.filter(({ x }) => x > left - CLEAR && x < right + CLEAR);

describe('the conveyor belts on the roads', () => {
  it('run in the iron works', () => {
    const roads = new Set(placed.map(({ mission }) => mission.name));

    expect([...roads]).toEqual(['Iron Works']);
  });

  it('each run its segments long into the furnace at the end they run toward', () => {
    for (const { mission, belt, label } of placed) {
      expect(Math.abs(belt.direction), label).toBe(1);
      expect(belt.to - belt.from, label).toBe(beltLength(belt.segments));
      expect(belt.y, label).toBe(groundAt(mission.terrain, mouthOf(belt)));
    }
  });

  it('each lie on level ground, belt and furnace, on the screen a fight locks on', () => {
    for (const { mission, belt, label } of placed) {
      const [left, right] = footprint(belt);
      const heights = new Set();
      for (let x = left - CLEAR; x <= right + CLEAR; x++) {
        heights.add(groundAt(mission.terrain, x));
      }
      const zone = mission.zones.find((item) => belt.from > item.left && belt.to < item.right);

      expect(heights.size, label).toBe(1);
      expect(zone?.boss, label).toBeNull();
      expect(left, label).toBeGreaterThan(zone.right - VIEW_WIDTH);
      expect(right, label).toBeLessThan(zone.right);
    }
  });

  it('each stand clear of crates, catwalks and the drop hammers', () => {
    for (const { mission, belt, label } of placed) {
      const span = footprint(belt);
      const catwalks = mission.terrain.platforms.filter(
        (platform) => platform.x < span[1] + CLEAR && platform.x + platform.width > span[0] - CLEAR,
      );
      const hammers = near(mission.hammers, [
        span[0] - HAMMER.halfWidth,
        span[1] + HAMMER.halfWidth,
      ]);

      expect(near(mission.crates, span), label).toEqual([]);
      expect(catwalks, label).toEqual([]);
      expect(hammers, label).toEqual([]);
    }
  });
});
