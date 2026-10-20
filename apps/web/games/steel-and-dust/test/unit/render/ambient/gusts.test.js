import { describe, expect, it } from 'vitest';
import { PAINTED_THEMES } from '../../../../src/art/painted-themes/index.js';
import { stormStrength } from '../../../../src/render/scene/ambient/storm.js';
import { SAMPLE_EFFECTS, rectsOf, ticksUpTo } from './ambient-recorder.js';

const gusts = SAMPLE_EFFECTS.gusts;
const [headColor, tailColor] = PAINTED_THEMES.sandstormPass.ambient.gusts;
const CALM = 2381;
const FULL = 1652;
const heads = (rects) => rects.filter((rect) => rect.color === headColor);

describe('ambient gusts', () => {
  it('blow streaks of sand from right to left', () => {
    const oneStreak = { ...gusts, count: 1, drift: 0 };
    const xs = ticksUpTo(60, 2)
      .map((tick) => heads(rectsOf(oneStreak, { tick: FULL + tick }))[0]?.x)
      .filter((x) => x !== undefined);
    const steps = xs.slice(1).map((x, i) => x - xs[i]);
    expect(steps.filter((step) => step < 0).length).toBeGreaterThan(steps.length * 0.8);
  });

  it('blow thicker and brighter as the storm rises', () => {
    expect(stormStrength(CALM)).toBeLessThan(0.1);
    expect(stormStrength(FULL)).toBeGreaterThan(0.9);
    const calm = heads(rectsOf(gusts, { tick: CALM }));
    const full = heads(rectsOf(gusts, { tick: FULL }));
    expect(full.length).toBeGreaterThan(calm.length * 2);
    const brightest = (rects) => Math.max(...rects.map((rect) => rect.alpha));
    expect(brightest(full)).toBeGreaterThan(brightest(calm));
  });

  it('give each streak a bright head and a fainter tail trailing behind it', () => {
    const [head, tail] = ticksUpTo(120, 1)
      .map((tick) => rectsOf({ ...gusts, count: 1 }, { tick: FULL + tick }))
      .find((rects) => rects.length === 2 && rects[0].x > 0 && rects[1].x < 360);
    expect([head.color, tail.color]).toEqual([headColor, tailColor]);
    expect(tail.alpha).toBeLessThan(head.alpha);
    expect([head.height, tail.height]).toEqual([1, 1]);
  });

  it('keep each streak inside the band it blows through', () => {
    for (const tick of ticksUpTo(1200, 60)) {
      for (const rect of rectsOf(gusts, { tick })) {
        expect(rect.y).toBeGreaterThanOrEqual(gusts.top - 2);
        expect(rect.y).toBeLessThanOrEqual(gusts.bottom + 2);
      }
    }
  });
});
