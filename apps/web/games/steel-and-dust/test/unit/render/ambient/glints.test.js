import { describe, expect, it } from 'vitest';
import { CYCLE_WIDTH } from '../../../../src/render/scene/ambient/motion.js';
import {
  ALL_COLORS,
  SAMPLE_EFFECTS,
  rectsOf,
  recordEffect,
  ticksUpTo,
} from './ambient-recorder.js';

const glints = SAMPLE_EFFECTS.glints;
const oneGlint = { ...glints, count: 1, drift: 1 };
// where the camera brings that one glint into view
const IN_VIEW = 100;
const isArm = (rect) => rect.width === 1 && rect.height > 1;

describe('ambient glints', () => {
  const frames = ticksUpTo(2400, 4).map((tick) => rectsOf(glints, { tick }));
  const rects = frames.flat();

  it('lie on the water as 1px-tall dashes, 1 to 5px long, inside their band', () => {
    const dashes = rects.filter((rect) => !isArm(rect));
    expect(dashes.length).toBeGreaterThan(1000);
    for (const dash of dashes) {
      expect(dash.height).toBe(1);
      expect(dash.y).toBeGreaterThanOrEqual(glints.top);
      expect(dash.y).toBeLessThanOrEqual(glints.bottom);
    }
    const plainLengths = new Set(dashes.map((dash) => dash.width).filter((width) => width <= 5));
    expect([...plainLengths].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('flash now and then as a small cross, the brightest color at its heart', () => {
    const arms = rects.filter(isArm);
    expect(arms.length).toBeGreaterThan(10);
    expect(arms.length).toBeLessThan(frames.length);
    for (const frame of frames) {
      frame.forEach((arm, i) => {
        if (isArm(arm)) {
          const [across, heart] = frame.slice(i + 1, i + 3);
          expect(across).toMatchObject({ y: arm.y + (arm.height - 1) / 2, height: 1 });
          expect(heart).toMatchObject({
            x: arm.x,
            y: across.y,
            width: 1,
            color: ALL_COLORS.glints[0],
          });
        }
      });
    }
  });

  it('twinkle: each glint is lit only part of the time, growing and shrinking', () => {
    const seen = ticksUpTo(2400, 2).map((tick) => rectsOf(oneGlint, { tick, cameraX: IN_VIEW }));
    const lit = seen.filter((frame) => frame.length > 0);
    expect(lit.length).toBeGreaterThan(seen.length * 0.15);
    expect(lit.length).toBeLessThan(seen.length * 0.7);
    expect(new Set(lit.map((frame) => frame.at(-1).width)).size).toBeGreaterThan(2);
  });

  it('only use the water colors, brightest when longest', () => {
    const palette = ALL_COLORS.glints;
    expect(rects.every((rect) => palette.includes(rect.color))).toBe(true);
    const longest = rects.filter((rect) => rect.height === 1 && rect.width >= 4);
    expect(longest.every((rect) => rect.color !== palette.at(-1))).toBe(true);
  });

  it('stay glued to the water, scrolling with the camera by their drift and wrapping', () => {
    const tick = ticksUpTo(2400, 2).find((at) => {
      const [dash] = rectsOf(oneGlint, { tick: at, cameraX: IN_VIEW });
      return dash && dash.x > 40 && dash.x < 300;
    });
    const atStart = rectsOf(oneGlint, { tick, cameraX: IN_VIEW });
    expect(atStart.length).toBeGreaterThan(0);
    expect(rectsOf(oneGlint, { tick, cameraX: IN_VIEW + 30 })).toEqual(
      atStart.map((rect) => ({ ...rect, x: rect.x - 30 })),
    );
    expect(recordEffect(oneGlint, { tick, cameraX: IN_VIEW + CYCLE_WIDTH }).log).toEqual(
      recordEffect(oneGlint, { tick, cameraX: IN_VIEW }).log,
    );
  });
});
