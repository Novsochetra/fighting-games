import { describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { FLAT_TERRAIN, isLevelUnder, layoutTerrain } from '../../../src/data/missions/terrain.js';

const zones = [
  { left: 300, right: 684 },
  { left: 984, right: 1752 },
];

describe('laying out terrain', () => {
  it('leaves a road with no ground or platforms flat, with no height table at all', () => {
    expect(layoutTerrain([{ screens: 1 }, { screens: 2 }], zones, 1752)).toBe(FLAT_TERRAIN);
    expect(FLAT_TERRAIN.heights).toBeNull();
    expect(FLAT_TERRAIN.platforms).toEqual([]);
  });

  it('raises straight slopes between the points of a zone, measured from its left wall', () => {
    const terrain = layoutTerrain(
      [
        {
          ground: [
            [0, 0],
            [40, 20],
            [100, 20],
            [140, 0],
          ],
        },
        {},
      ],
      zones,
      1752,
    );
    const at = (x) => terrain.heights[x];
    expect([at(299), at(300), at(320), at(340), at(370), at(420), at(440), at(441)]).toEqual([
      GROUND_Y,
      GROUND_Y,
      GROUND_Y - 10,
      GROUND_Y - 20,
      GROUND_Y - 20,
      GROUND_Y - 10,
      GROUND_Y,
      GROUND_Y,
    ]);
    expect(terrain.heights).toHaveLength(1753);
  });

  it('turns the same offset twice into a sheer step, the new height starting on that column', () => {
    const terrain = layoutTerrain(
      [
        {},
        {
          ground: [
            [-60, 0],
            [-20, 0],
            [-20, 24],
            [30, 24],
            [30, 0],
          ],
        },
      ],
      zones,
      1752,
    );
    const at = (x) => terrain.heights[x];
    expect([at(963), at(964), at(1013), at(1014)]).toEqual([
      GROUND_Y,
      GROUND_Y - 24,
      GROUND_Y - 24,
      GROUND_Y,
    ]);
  });

  it('puts each platform at its rise above the ground under its left end', () => {
    const terrain = layoutTerrain(
      [
        {
          ground: [
            [0, 0],
            [20, 16],
            [200, 16],
            [220, 0],
          ],
          platforms: [{ at: 40, width: 64, rise: 40, kind: 'log' }],
        },
        { platforms: [{ at: 100, width: 48, rise: 30, kind: 'rock' }] },
      ],
      zones,
      1752,
    );
    expect(terrain.platforms).toEqual([
      { x: 340, y: GROUND_Y - 56, width: 64, kind: 'log' },
      { x: 1084, y: GROUND_Y - 30, width: 48, kind: 'rock' },
    ]);
  });
});

describe('level ground under a footprint', () => {
  const terrain = layoutTerrain(
    [
      {
        ground: [
          [0, 0],
          [40, 20],
          [100, 20],
          [140, 0],
        ],
      },
      {},
    ],
    zones,
    1752,
  );

  it('is everywhere on a flat road', () => {
    expect(isLevelUnder(FLAT_TERRAIN, 500, 30)).toBe(true);
  });

  it('is on a hilltop or the plain road, not on a slope', () => {
    expect(isLevelUnder(terrain, 370, 20)).toBe(true);
    expect(isLevelUnder(terrain, 200, 20)).toBe(true);
    expect(isLevelUnder(terrain, 330, 20)).toBe(false);
    expect(isLevelUnder(terrain, 430, 20)).toBe(false);
  });
});
