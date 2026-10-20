import { describe, expect, it } from 'vitest';
import { shadeColor } from '../../../src/lib/color.js';

describe('color helpers', () => {
  it('lightens toward white and darkens toward black', () => {
    expect(shadeColor('#804020', 0.5)).toBe('#c0a090');
    expect(shadeColor('#804020', -0.5)).toBe('#402010');
    expect(shadeColor('#804020', 0)).toBe('#804020');
  });
});
