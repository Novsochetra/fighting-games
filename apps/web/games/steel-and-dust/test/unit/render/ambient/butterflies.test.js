import { describe, expect, it } from 'vitest';
import { CYCLE_WIDTH } from '../../../../src/render/scene/ambient/motion.js';
import {
  ALL_COLORS,
  SAMPLE_EFFECTS,
  rectsOf,
  recordEffect,
  ticksUpTo,
} from './ambient-recorder.js';

const butterflies = SAMPLE_EFFECTS.butterflies;
const palette = ALL_COLORS.butterflies;
const oneButterfly = { ...butterflies, count: 1, drift: 1 };

// a butterfly is its wing rects in its own color, then its body in a darker one
function butterfliesIn(rects) {
  const found = [];
  rects.forEach((rect, i) => {
    if (i === 0 || rects[i - 1].color !== rect.color) {
      found.push({ color: rect.color, rects: [] });
    }
    found.at(-1).rects.push(rect);
  });
  return found
    .filter((_, i) => i % 2 === 0)
    .map((wings, i) => ({ ...wings, body: found[i * 2 + 1] }));
}

const corner = (rects) => ({
  x: Math.min(...rects.map((rect) => rect.x)),
  y: Math.min(...rects.map((rect) => rect.y)),
});

describe('ambient butterflies', () => {
  const frames = ticksUpTo(1800, 3).map((tick) => rectsOf(butterflies, { tick }));

  it('stay inside their band', () => {
    for (const rect of frames.flat()) {
      expect(rect.y).toBeGreaterThanOrEqual(butterflies.top);
      expect(rect.y + rect.height).toBeLessThanOrEqual(butterflies.bottom);
    }
  });

  it('each wear their own color from the palette, with a darker body', () => {
    const wingColors = new Set();
    for (const frame of frames) {
      for (const { color, body } of butterfliesIn(frame)) {
        wingColors.add(color);
        expect(body.rects).toHaveLength(1);
        expect(body.color).not.toBe(color);
      }
    }
    expect([...wingColors].sort()).toEqual([...palette].sort());
  });

  it('flap between wings spread and wings raised, and sometimes glide', () => {
    const wingCounts = ticksUpTo(600, 1).map(
      (tick) => rectsOf(oneButterfly, { tick, cameraX: 200 }).length - 1,
    );
    expect(new Set(wingCounts)).toEqual(new Set([4, 2]));
    const flips = wingCounts.slice(1).filter((count, i) => count !== wingCounts[i]).length;
    expect(flips).toBeGreaterThan(60);
    let longestSpread = 0;
    let run = 0;
    for (const count of wingCounts) {
      run = count === 4 ? run + 1 : 0;
      longestSpread = Math.max(longestSpread, run);
    }
    expect(longestSpread).toBeGreaterThan(20);
  });

  it('wander on a lazy curved path, a pixel or two at a time', () => {
    const spots = ticksUpTo(1200, 2).map((tick) =>
      corner(rectsOf(oneButterfly, { tick, cameraX: 200 })),
    );
    const xs = spots.map((spot) => spot.x);
    const ys = spots.map((spot) => spot.y);
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(20);
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(15);
    spots.slice(1).forEach((spot, i) => {
      expect(Math.abs(spot.x - spots[i].x)).toBeLessThanOrEqual(3);
      expect(Math.abs(spot.y - spots[i].y)).toBeLessThanOrEqual(3);
    });
  });

  it('move with the camera by their drift and wrap sideways', () => {
    const still = rectsOf(oneButterfly, { tick: 90, cameraX: 200 });
    expect(still.length).toBeGreaterThan(0);
    expect(rectsOf(oneButterfly, { tick: 90, cameraX: 230 })).toEqual(
      still.map((rect) => ({ ...rect, x: rect.x - 30 })),
    );
    expect(recordEffect(oneButterfly, { tick: 90, cameraX: 200 + CYCLE_WIDTH }).log).toEqual(
      recordEffect(oneButterfly, { tick: 90, cameraX: 200 }).log,
    );
  });
});
