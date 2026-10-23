import { afterEach, describe, expect, it, vi } from 'vitest';
import { COLORS } from '../../../../src/art/colors.js';
import { FX_COLORS } from '../../../../src/art/fx-colors.js';
import { eyeArm } from '../../../../src/render/fx/gaze-flares.js';
import {
  RAY_AFTER,
  RAY_LEAD,
  drawGazeRay,
  rayBands,
  rayMotes,
  rayReach,
} from '../../../../src/render/fx/gaze-ray.js';
import { boundsOf, drawnRects, offGrid, recordingPainter } from './fx-recorder.js';

const pillarAt = (time, spot = { x: 120, y: 184 }) => ({
  ...spot,
  time,
  wait: 28,
  eyes: { x: 200, y: 100 },
});

function raySolids(time, spot) {
  const { painter, log } = recordingPainter();
  drawGazeRay(painter, pillarAt(time, spot));
  return { rects: drawnRects(log), log };
}

const rayTimes = Array.from({ length: RAY_LEAD + RAY_AFTER }, (_, i) => i - RAY_LEAD);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("the gaze ray's bands", () => {
  it('are odd widths nested from the white-hot core out to the glow', () => {
    for (const time of rayTimes) {
      const [core, body, edge, glow] = rayBands(time);
      for (const width of [core, body, edge, glow]) {
        expect(width % 2).toBe(1);
      }
      expect(core).toBeLessThanOrEqual(body);
      expect(body).toBeLessThan(edge);
      expect(edge).toBeLessThan(glow);
    }
  });

  it('are thin as it shoots out, widest as the pillar bursts and thin again as it dies', () => {
    const widest = Math.max(...rayTimes.map((time) => rayBands(time)[3]));
    expect(rayBands(0)[3]).toBe(widest);
    expect(rayBands(-RAY_LEAD)[3]).toBeLessThan(widest);
    expect(rayBands(RAY_AFTER - 1)[3]).toBeLessThan(widest);
  });
});

describe('the gaze ray', () => {
  it('shoots out of his eyes to the spot over its first ticks', () => {
    expect(rayReach(-RAY_LEAD)).toBeGreaterThan(0);
    expect(rayReach(-RAY_LEAD)).toBeLessThan(1);
    expect(rayReach(-RAY_LEAD + 2)).toBe(1);
    const shooting = boundsOf(raySolids(-RAY_LEAD).rects);
    const reached = boundsOf(raySolids(-5).rects);
    expect(shooting.left).toBeGreaterThan(130);
    expect(reached.left).toBeLessThanOrEqual(121);
    expect(reached.bottom).toBeGreaterThanOrEqual(184);
  });

  it('carries motes of light down it from his eyes, inside the stretch it reaches', () => {
    for (const time of rayTimes) {
      for (const share of rayMotes(time)) {
        expect(share).toBeGreaterThanOrEqual(0);
        expect(share).toBeLessThanOrEqual(rayReach(time));
      }
    }
    const [first] = rayMotes(-5);
    expect(rayMotes(-4)[0]).toBeGreaterThan(first);
  });

  it('draws on the screen-pixel grid: a white core in a gold body, with a glow of light', () => {
    for (const time of rayTimes) {
      const { rects } = raySolids(time);
      expect(offGrid(rects)).toEqual([]);
      expect(rects.some((rect) => rect.color === COLORS.white && !rect.light)).toBe(true);
      expect(rects.some((rect) => rect.color === FX_COLORS.gazeGold && !rect.light)).toBe(true);
      expect(rects.some((rect) => rect.color === FX_COLORS.gazeEmber && rect.light)).toBe(true);
    }
  });

  it('keeps its width at any slant, and draws the same frame twice without Math.random', () => {
    const random = vi.spyOn(Math, 'random');
    const steep = boundsOf(raySolids(-5, { x: 196, y: 184 }).rects);
    expect(steep.right - steep.left).toBeLessThan(12);
    expect(raySolids(-5).log).toEqual(raySolids(-5).log);
    expect(random).not.toHaveBeenCalled();
  });
});

describe('the flare in his eyes', () => {
  it('throbs while the ray burns, flares as the pillar bursts and shrinks as the ray dies', () => {
    const throbs = new Set(rayTimes.filter((time) => time < 0).map(eyeArm));
    expect(throbs.size).toBeGreaterThan(2);
    expect(eyeArm(0)).toBeGreaterThan(Math.max(...throbs));
    expect(eyeArm(RAY_AFTER - 1)).toBeLessThan(Math.min(...throbs));
  });
});
