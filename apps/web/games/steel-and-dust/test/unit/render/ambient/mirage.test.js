import { describe, expect, it } from 'vitest';
import { ALL_COLORS, SAMPLE_EFFECTS, rectsOf, ticksUpTo } from './ambient-recorder.js';

const mirage = SAMPLE_EFFECTS.mirage;

describe('ambient mirage', () => {
  const frames = ticksUpTo(600, 5).map((tick) => rectsOf(mirage, { tick }));

  it('lays thin streaks along the horizon band only', () => {
    for (const rect of frames.flat()) {
      expect(rect.height).toBe(1);
      expect(rect.y).toBeGreaterThanOrEqual(mirage.y - 1);
      expect(rect.y).toBeLessThanOrEqual(mirage.y + mirage.height + 1);
    }
  });

  it('alternates rows of afterglow and mirrored sky', () => {
    const [glow, sky] = ALL_COLORS.mirage;
    const colors = new Set(frames.flat().map((rect) => rect.color));
    expect(colors).toEqual(new Set([glow, sky]));
  });

  it('trembles: the streaks shift and stretch from moment to moment', () => {
    const lefts = (rects) => rects.map((rect) => rect.x).join(',');
    const widths = (rects) => rects.map((rect) => rect.width).join(',');
    expect(new Set(frames.map(lefts)).size).toBeGreaterThan(frames.length / 2);
    expect(new Set(frames.map(widths)).size).toBeGreaterThan(1);
  });

  it('stays faint, so the far plate shows through', () => {
    for (const rect of frames.flat()) {
      expect(rect.alpha).toBeLessThan(0.6);
    }
  });

  it('slides with the far plate when the camera moves', () => {
    const still = rectsOf(mirage, { tick: 40 });
    const moved = rectsOf(mirage, { tick: 40, cameraX: 100 });
    expect(moved.map((rect) => rect.x)).not.toEqual(still.map((rect) => rect.x));
  });
});
