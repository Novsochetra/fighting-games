import { describe, expect, it } from 'vitest';
import { PAINTED_THEMES } from '../../../../src/art/painted-themes/index.js';
import { SAMPLE_EFFECTS, rectsOf, recordEffect, ticksUpTo } from './ambient-recorder.js';

const weeds = SAMPLE_EFFECTS.tumbleweeds;
const oneWeed = { ...weeds, count: 1, drift: 0 };
const [, , shadowColor] = PAINTED_THEMES.sandstormPass.ambient.tumbleweed;

const ballOf = (tick) => rectsOf(oneWeed, { tick }).filter((rect) => rect.alpha === 1);

describe('ambient tumbleweeds', () => {
  it('roll with the wind from right to left', () => {
    const lefts = ticksUpTo(60, 6)
      .map((tick) => ballOf(200 + tick))
      .filter((rects) => rects.length)
      .map((rects) => Math.min(...rects.map((rect) => rect.x)));
    expect(lefts.length).toBeGreaterThan(3);
    expect(lefts.at(-1)).toBeLessThan(lefts[0]);
  });

  it('bounce above the ground with a faint shadow under them', () => {
    const lifts = new Set();
    for (const tick of ticksUpTo(300, 5)) {
      const rects = rectsOf(oneWeed, { tick });
      if (!rects.length) {
        continue;
      }
      const [shadow, ...ball] = rects;
      expect(shadow).toMatchObject({ y: weeds.y, height: 1, color: shadowColor });
      expect(shadow.alpha).toBeLessThan(0.5);
      const bottom = Math.max(...ball.map((rect) => rect.y + rect.height));
      expect(bottom).toBeLessThanOrEqual(weeds.y);
      lifts.add(weeds.y - bottom);
    }
    expect(lifts.size).toBeGreaterThan(3);
  });

  it('stay away for some laps, so the road is not crossed at a steady beat', () => {
    const rare = { ...oneWeed, often: 0.5 };
    const lap = Math.round((384 + 32) / (weeds.speed * 0.75));
    const shown = ticksUpTo(lap * 30, lap).map(
      (tick) => recordEffect(rare, { tick: tick + lap / 2 }).log.length > 0,
    );
    expect(shown.some(Boolean)).toBe(true);
    expect(shown.some((isShown) => !isShown)).toBe(true);
  });
});
