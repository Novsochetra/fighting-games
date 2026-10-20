import { describe, expect, it } from 'vitest';
import { GROUND_Y, VIEW_WIDTH } from '../../../src/config.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { PLATFORM_SPRITES } from '../../../src/data/platform-sprites.js';
import { STEP_UP, groundAt } from '../../../src/sim/stage/terrain.js';

const ZONE_PAD = 40;
const MAX_RISE = 40;
const MAX_WALL = 24;
const LOCK_RISE = 16;

const heightsBetween = (mission, from, to) =>
  Array.from({ length: to - from + 1 }, (_, i) => groundAt(mission.terrain, from + i));
const isLevel = (mission, from, to) => new Set(heightsBetween(mission, from, to)).size === 1;
const lockScreen = (zone) => [zone.right - VIEW_WIDTH, zone.right];

describe('the terrain of every mission', () => {
  it('keeps the start of the road level, where the title screen stands', () => {
    for (const mission of MISSIONS) {
      expect(isLevel(mission, 0, 300), mission.name).toBe(true);
      expect(groundAt(mission.terrain, 0), mission.name).toBe(GROUND_Y);
    }
  });

  it('rises at most 40px, with no wall taller than 24px', () => {
    for (const mission of MISSIONS) {
      const heights = heightsBetween(mission, 0, mission.length);
      expect(Math.min(...heights), mission.name).toBeGreaterThanOrEqual(GROUND_Y - MAX_RISE);
      expect(Math.max(...heights), mission.name).toBe(GROUND_Y);
      for (let x = 1; x < heights.length; x++) {
        expect(
          Math.abs(heights[x] - heights[x - 1]),
          `${mission.name} at ${x}`,
        ).toBeLessThanOrEqual(MAX_WALL);
      }
    }
  });

  it('keeps boss arenas flat and every zone wall on level ground', () => {
    for (const mission of MISSIONS) {
      for (const zone of mission.zones) {
        const label = `${mission.name} ${zone.label}`;
        expect(isLevel(mission, zone.left - ZONE_PAD, zone.left + ZONE_PAD), label).toBe(true);
        expect(isLevel(mission, zone.right - ZONE_PAD, zone.right), label).toBe(true);
        if (zone.boss) {
          expect(isLevel(mission, zone.left, zone.right), label).toBe(true);
        }
      }
    }
  });

  it('keeps the screen a zone locks on gentle: low hills and no walls', () => {
    for (const mission of MISSIONS) {
      for (const zone of mission.zones) {
        const [from, to] = lockScreen(zone);
        const heights = heightsBetween(mission, from, to);
        const label = `${mission.name} ${zone.label}`;
        expect(Math.min(...heights), label).toBeGreaterThanOrEqual(GROUND_Y - LOCK_RISE);
        for (let x = 1; x < heights.length; x++) {
          expect(Math.abs(heights[x] - heights[x - 1]), label).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it('sets every crate down on level ground', () => {
    for (const mission of MISSIONS) {
      for (const crate of mission.crates) {
        expect(
          isLevel(mission, crate.x - 12, crate.x + 12),
          `${mission.name} crate at ${crate.x}`,
        ).toBe(true);
      }
    }
  });

  it('builds platforms from their sprites, within jumping reach and clear of the zone walls', () => {
    for (const mission of MISSIONS) {
      for (const platform of mission.terrain.platforms) {
        const label = `${mission.name} ${platform.kind} at ${platform.x}`;
        const sprite = PLATFORM_SPRITES[platform.kind];
        expect(sprite, label).toBeDefined();
        expect(platform.width, label).toBe(sprite.width);
        const zone = mission.zones.find(
          (item) => platform.x >= item.left && platform.x < item.right,
        );
        expect(zone?.boss ?? null, label).toBeNull();
        if (zone) {
          expect(platform.x, label).toBeGreaterThanOrEqual(zone.left + ZONE_PAD);
          expect(platform.x + platform.width, label).toBeLessThanOrEqual(zone.right - ZONE_PAD);
        }
        const rise = groundAt(mission.terrain, platform.x) - platform.y;
        expect(platform.y, label).toBeGreaterThanOrEqual(GROUND_Y - 80);
        expect(rise, label).toBeGreaterThanOrEqual(24);
        expect(rise, label).toBeLessThanOrEqual(44);
        expect(rise, label).toBeGreaterThan(STEP_UP);
      }
    }
  });
});
