import { describe, expect, it } from 'vitest';
import { flickerAt } from '../../../../src/render/scene/ambient/flames.js';
import { ALL_COLORS, rectsOf, ticksUpTo } from './ambient-recorder.js';

const torch = {
  kind: 'flames',
  plane: 'back',
  size: 10,
  emitters: [{ x: 200, y: 150 }],
  tileWidth: 1000,
  drift: 1,
};

const tongueOf = (rects) => rects.filter((rect) => rect.height === 1);
const glowOf = (rects) => rects.filter((rect) => rect.height > 1);

describe('ambient flames', () => {
  it('light a warm pool of glow around the fire, brightest at its heart', () => {
    const glow = glowOf(rectsOf(torch, { tick: 40 }));
    expect(glow).toHaveLength(3);
    expect(glow.every((rect) => rect.color === ALL_COLORS.glow)).toBe(true);
    const widths = glow.map((rect) => rect.width);
    expect(widths).toEqual([...widths].sort((first, second) => second - first));
    for (const rect of glow) {
      expect(rect.x + rect.width / 2).toBeCloseTo(200, 0);
    }
  });

  it('burn as a tongue that rises from the emitter and narrows to its tip', () => {
    for (const tick of ticksUpTo(300, 37)) {
      const tongue = tongueOf(rectsOf(torch, { tick })).filter(
        (rect) => rect.color !== ALL_COLORS.flame[2],
      );
      expect(tongue[0].y).toBe(149);
      expect(tongue.at(-1).width).toBeLessThanOrEqual(tongue[0].width);
      expect(tongue.every((rect, i) => !i || rect.y === tongue[i - 1].y - 1)).toBe(true);
    }
  });

  it('flicker: the flame changes height and the glow its strength from tick to tick', () => {
    const heights = new Set();
    const glowAlphas = new Set();
    for (const tick of ticksUpTo(120, 3)) {
      const rects = rectsOf(torch, { tick });
      heights.add(new Set(tongueOf(rects).map((rect) => rect.y)).size);
      glowAlphas.add(glowOf(rects)[0].alpha);
    }
    expect(heights.size).toBeGreaterThan(3);
    expect(glowAlphas.size).toBeGreaterThan(10);
  });

  it('keeps each fire on its own beat, between dark and full', () => {
    for (const tick of ticksUpTo(600, 7)) {
      expect(flickerAt(0, tick)).toBeGreaterThanOrEqual(0);
      expect(flickerAt(0, tick)).toBeLessThanOrEqual(1);
    }
    expect(flickerAt(0, 90)).not.toBe(flickerAt(1, 90));
  });

  it('follow the near layer when the camera moves', () => {
    const still = rectsOf(torch, { tick: 30 });
    const moved = rectsOf(torch, { tick: 30, cameraX: 50 });
    expect(moved).toEqual(still.map((rect) => ({ ...rect, x: rect.x - 50 })));
  });
});
