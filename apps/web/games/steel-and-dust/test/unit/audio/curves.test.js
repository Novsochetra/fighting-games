import { describe, expect, it } from 'vitest';
import {
  asCurve,
  expCurve,
  glide,
  linearCurve,
  swell,
  toPairs,
} from '../../../src/audio/synth/curves.js';

describe('toPairs', () => {
  it('reads flat points as [time, value] pairs', () => {
    expect(toPairs([0, 1, 0.5, 2, 1, 3])).toEqual([
      [0, 1],
      [0.5, 2],
      [1, 3],
    ]);
  });
});

describe('linearCurve', () => {
  const level = linearCurve([0, 0, 0.1, 1, 0.3, 0]);

  it('holds the first and last values outside the points', () => {
    expect(level(-1)).toBe(0);
    expect(level(5)).toBe(0);
  });

  it('interpolates in a straight line between neighbouring points', () => {
    expect(level(0.05)).toBeCloseTo(0.5, 12);
    expect(level(0.1)).toBe(1);
    expect(level(0.2)).toBeCloseTo(0.5, 12);
  });

  it('works with a single point', () => {
    expect(linearCurve([0, 0.4])(3)).toBe(0.4);
  });
});

describe('expCurve', () => {
  it('moves by equal ratios, as pitches and cutoffs do', () => {
    const cutoff = expCurve([0, 100, 1, 400]);
    expect(cutoff(0.5)).toBeCloseTo(200, 9);
    expect(cutoff(0.25)).toBeCloseTo(100 * Math.SQRT2, 9);
  });
});

describe('glide', () => {
  it('is a two-point exponential curve from a start value', () => {
    const drop = glide(150, 0.05, 60);
    expect(drop(0)).toBe(150);
    expect(drop(0.05)).toBe(60);
    expect(drop(0.025)).toBeCloseTo(Math.sqrt(150 * 60), 9);
  });
});

describe('asCurve', () => {
  it('turns a constant into a curve and leaves functions alone', () => {
    const curve = (time) => time * 2;
    expect(asCurve(curve)).toBe(curve);
    expect(asCurve(7)(123)).toBe(7);
  });
});

describe('swell', () => {
  const level = swell({ peak: 0.1, length: 0.3 });

  it('rises from silence to 1 at the peak and falls back to silence at the end', () => {
    expect(level(0)).toBe(0);
    expect(level(0.05)).toBeCloseTo(0.5, 12);
    expect(level(0.1)).toBe(1);
    expect(level(0.2)).toBeCloseTo(0.25, 12);
    expect(level(0.3)).toBe(0);
    expect(level(-0.1)).toBe(0);
    expect(level(0.4)).toBe(0);
  });

  it('eases in, so the first steps are tiny', () => {
    expect(level(0.001)).toBeLessThan(0.001);
  });

  it('lets go of the peak sooner with a larger fall', () => {
    expect(swell({ peak: 0.1, length: 0.3, fall: 3 })(0.2)).toBeLessThan(level(0.2));
  });
});
