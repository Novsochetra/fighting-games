import { describe, expect, it } from 'vitest';
import { ALL_COLORS, rectsOf, ticksUpTo } from './ambient-recorder.js';

const ledge = {
  kind: 'trickle',
  plane: 'back',
  emitters: [{ x: 200, y: 80, fall: 50 }],
  tileWidth: 1000,
  drift: 1,
};

describe('ambient sand trickles', () => {
  const frames = ticksUpTo(3000, 7).map((tick) => rectsOf(ledge, { tick }));

  it('fall from the ledge down to where they land, no further', () => {
    for (const rect of frames.flat()) {
      expect(rect.y).toBeGreaterThanOrEqual(80);
      expect(rect.y + rect.height).toBeLessThanOrEqual(80 + 50 + 1);
      expect(rect.x).toBeGreaterThanOrEqual(199);
      expect(rect.x + rect.width).toBeLessThanOrEqual(202);
    }
  });

  it('run in spells: some moments pour sand and some are still', () => {
    expect(frames.some((rects) => rects.length === 0)).toBe(true);
    expect(frames.some((rects) => rects.length > 5)).toBe(true);
  });

  it('drop grains that speed up as they fall', () => {
    const grainsAt = (tick) =>
      rectsOf(ledge, { tick }).filter(
        (rect) => rect.color === ALL_COLORS.trickle[0] && rect.height <= 2,
      );
    const busiest = ticksUpTo(3000, 7)
      .map(grainsAt)
      .reduce((most, grains) => (grains.length > most.length ? grains : most));
    expect(busiest.length).toBeGreaterThan(4);
    const ys = [...new Set(busiest.map((rect) => rect.y - 80))].sort(
      (first, second) => first - second,
    );
    const gaps = ys.slice(1).map((y, i) => y - ys[i]);
    expect(gaps.at(-1)).toBeGreaterThan(gaps[0]);
  });

  it('stay on their ledge when the camera moves', () => {
    const tick = ticksUpTo(3000, 7).find((at) => rectsOf(ledge, { tick: at }).length > 0);
    const still = rectsOf(ledge, { tick });
    const moved = rectsOf(ledge, { tick, cameraX: 40 });
    expect(moved).toEqual(still.map((rect) => ({ ...rect, x: rect.x - 40 })));
  });
});
