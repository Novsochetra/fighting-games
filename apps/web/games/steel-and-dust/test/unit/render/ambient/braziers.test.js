import { describe, expect, it } from 'vitest';
import { ALL_COLORS, rectsOf, ticksUpTo } from './ambient-recorder.js';

const brazier = {
  kind: 'braziers',
  plane: 'back',
  emitters: [{ x: 200, y: 150 }],
  tileWidth: 1000,
  drift: 1,
};

const flameRects = (rects) => rects.filter((rect) => rect.color !== ALL_COLORS.flameGlow);

describe('ambient brazier fires', () => {
  it('burn above the bowl, narrowing toward the tips', () => {
    for (const tick of ticksUpTo(300, 10)) {
      const rects = flameRects(rectsOf(brazier, { tick }));
      expect(rects.length).toBeGreaterThan(10);
      for (const rect of rects) {
        expect(rect.y).toBeLessThan(150);
        expect(rect.y).toBeGreaterThan(150 - 24);
        expect(Math.abs(rect.x + rect.width / 2 - 200)).toBeLessThan(12);
      }
      const bottom = rects.filter((rect) => rect.y === 149);
      const top = Math.min(...rects.map((rect) => rect.y));
      const tips = rects.filter((rect) => rect.y === top);
      expect(Math.max(...bottom.map((rect) => rect.width))).toBeGreaterThan(
        Math.max(...tips.map((rect) => rect.width)),
      );
    }
  });

  it('flicker: the flame changes height over time', () => {
    const heights = ticksUpTo(120, 3).map(
      (tick) => 150 - Math.min(...flameRects(rectsOf(brazier, { tick })).map((rect) => rect.y)),
    );
    expect(new Set(heights).size).toBeGreaterThan(3);
  });

  it('use a white core, a pale middle and a deep outer color, in a soft glow', () => {
    const colors = new Set(rectsOf(brazier, { tick: 30 }).map((rect) => rect.color));
    for (const color of [...ALL_COLORS.flame, ALL_COLORS.flameGlow]) {
      expect(colors.has(color), color).toBe(true);
    }
    const glow = rectsOf(brazier, { tick: 30 }).filter(
      (rect) => rect.color === ALL_COLORS.flameGlow,
    );
    expect(Math.max(...glow.map((rect) => rect.alpha))).toBeLessThan(0.1);
  });

  it('stay on their bowl when the camera moves', () => {
    const still = rectsOf(brazier, { tick: 45 });
    const moved = rectsOf(brazier, { tick: 45, cameraX: 60 });
    expect(moved).toEqual(still.map((rect) => ({ ...rect, x: rect.x - 60 })));
  });
});
