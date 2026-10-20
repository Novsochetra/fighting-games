import { describe, expect, it } from 'vitest';
import { ALL_COLORS, rectsOf, ticksUpTo } from './ambient-recorder.js';

const oneFirefly = {
  kind: 'fireflies',
  plane: 'front',
  count: 1,
  drift: 0,
  top: 90,
  bottom: 180,
};

describe('ambient fireflies', () => {
  const frames = ticksUpTo(1800, 4).map((tick) => rectsOf(oneFirefly, { tick }));
  const litFrames = frames.filter((rects) => rects.length > 0);

  it('are sometimes dark and sometimes lit', () => {
    expect(litFrames.length).toBeGreaterThan(frames.length * 0.15);
    expect(litFrames.length).toBeLessThan(frames.length * 0.85);
  });

  it('glow as a dim 3x3 halo around a bright 1px core', () => {
    const [haloColor, coreColor] = [ALL_COLORS.fireflies[1], ALL_COLORS.fireflies[0]];
    for (const [halo, core] of litFrames) {
      expect(halo).toMatchObject({ x: core.x - 1, y: core.y - 1, width: 3, height: 3 });
      expect(halo.color).toBe(haloColor);
      expect(core).toMatchObject({ width: 1, height: 1, color: coreColor });
      expect(halo.alpha).toBeLessThan(core.alpha);
    }
  });

  it('pulse in brightness and wander inside their band', () => {
    const cores = litFrames.map((rects) => rects[1]);
    expect(new Set(cores.map((core) => core.alpha)).size).toBeGreaterThan(5);
    expect(new Set(cores.map((core) => core.x)).size).toBeGreaterThan(5);
    for (const core of cores) {
      expect(core.y).toBeGreaterThanOrEqual(oneFirefly.top);
      expect(core.y).toBeLessThanOrEqual(oneFirefly.bottom);
    }
  });
});
