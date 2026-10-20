import { describe, expect, it } from 'vitest';
import { gradientSteps, mixColors, shadeColor, withAlpha } from '../../../src/lib/color.js';

describe('color helpers', () => {
  it('mixes two colors channel by channel', () => {
    expect(mixColors('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(mixColors('#ff0000', '#0000ff', 0)).toBe('#ff0000');
    expect(mixColors('#ff0000', '#0000ff', 1)).toBe('#0000ff');
  });

  it('lightens toward white and darkens toward black', () => {
    expect(shadeColor('#804020', 0.5)).toBe('#c0a090');
    expect(shadeColor('#804020', -0.5)).toBe('#402010');
  });

  it('writes a color with transparency', () => {
    expect(withAlpha('#f09660', 0.18)).toBe('rgba(240,150,96,0.18)');
  });

  it('spreads steps along every stop of a gradient', () => {
    expect(gradientSteps(['#000000', '#ffffff'], 3)).toEqual(['#000000', '#808080', '#ffffff']);
    const stops = ['#2a1b3d', '#552c63', '#a24d6b', '#f9d98a'];
    expect(gradientSteps(stops, 4)).toEqual(stops);
    expect(gradientSteps(stops, 10)).toHaveLength(10);
  });
});
