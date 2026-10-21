import { describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { fissurePoints } from '../../../src/sim/fx/fissure.js';
import { groundAt } from '../../../src/sim/stage/terrain.js';
import { buildTerrain } from '../../support/terrain-game.js';

const SPAN = { left: 100, right: 500 };

describe('the fissure the chop opens', () => {
  it('runs the whole span, a point every few px', () => {
    const points = fissurePoints({ heights: null }, SPAN);
    expect(points[0][0]).toBeLessThanOrEqual(SPAN.left);
    expect(points[points.length - 1][0]).toBeGreaterThanOrEqual(SPAN.right);
    const steps = new Set(points.slice(1).map(([x], i) => x - points[i][0]));
    expect(steps).toEqual(new Set([4]));
  });

  it('zigzags a few px down the face of the ground, never over its surface', () => {
    const terrain = buildTerrain({
      ground: [
        [200, 0],
        [260, 20],
        [400, 20],
      ],
    });
    const depths = fissurePoints(terrain, SPAN).map(([x, y]) => y - groundAt(terrain, x));
    expect(Math.min(...depths)).toBeGreaterThanOrEqual(1);
    expect(Math.max(...depths)).toBeLessThanOrEqual(4);
    expect(new Set(depths).size).toBeGreaterThan(2);
  });

  it('cracks the same stretch of road the same way every time', () => {
    const flat = { heights: null };
    const later = fissurePoints(flat, { left: 300, right: 500 });
    const earlier = fissurePoints(flat, SPAN).filter(([x]) => x >= 300);
    expect(later).toEqual(earlier);
    expect(later.every(([, y]) => y > GROUND_Y)).toBe(true);
  });
});
