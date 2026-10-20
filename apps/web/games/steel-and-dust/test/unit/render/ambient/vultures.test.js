import { describe, expect, it } from 'vitest';
import { SAMPLE_EFFECTS, rectsOf, ticksUpTo } from './ambient-recorder.js';

const vultures = SAMPLE_EFFECTS.vultures;
const lone = { ...vultures, count: 1, drift: 0 };

function bird(tick) {
  const rects = rectsOf(lone, { tick });
  const left = Math.min(...rects.map((rect) => rect.x));
  const top = Math.min(...rects.map((rect) => rect.y));
  return { left, top, rects };
}

describe('ambient vultures', () => {
  it('circle the same thermal, wider than they are tall', () => {
    const path = ticksUpTo(Math.round((Math.PI * 2) / vultures.turn), 20).map(bird);
    const lefts = path.map((spot) => spot.left);
    const tops = path.map((spot) => spot.top);
    const across = Math.max(...lefts) - Math.min(...lefts);
    const down = Math.max(...tops) - Math.min(...tops);
    expect(across).toBeGreaterThan(vultures.radius);
    expect(down).toBeGreaterThan(2);
    expect(down).toBeLessThan(across / 2);
  });

  it('glide most of the time and beat their wings now and then', () => {
    const shapes = ticksUpTo(800, 2).map((tick) => bird(tick).rects.length);
    const gliding = shapes.filter((count) => count === 5).length;
    expect(gliding).toBeGreaterThan(shapes.length * 0.8);
    expect(shapes.some((count) => count === 3)).toBe(true);
  });

  it('fly as many birds as asked, all in the vulture color', () => {
    const rects = rectsOf({ ...vultures, drift: 0 }, { tick: 2000 });
    expect(new Set(rects.map((rect) => rect.color)).size).toBe(1);
    expect(rects.length).toBeGreaterThanOrEqual(vultures.count * 3);
  });
});
