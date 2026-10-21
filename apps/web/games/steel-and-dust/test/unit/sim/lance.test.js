import { describe, expect, it } from 'vitest';
import { EMBER_SPEAR_TIPS } from '../../../src/data/ember-spear-tips.js';
import { HERO_SPRITES } from '../../../src/data/hero-sprites.js';
import { lanceScale, spearTipOf } from '../../../src/sim/summons/lance.js';

describe('the phoenix lance', () => {
  it('pours from the spear tip the strike strip holds, the way the spear points', () => {
    expect(spearTipOf({ id: 'L1' })).toEqual({ x: 18, y: -10, angle: 0 });
    const rising = spearTipOf({ id: 'S3', sprite: ['rising_dragon', 2] });
    expect(rising).toMatchObject({ x: 16, y: -33 });
    expect(rising.angle).toBeCloseTo((-55 * Math.PI) / 180);
    expect(spearTipOf({ id: 'ADK' }).angle).toBeCloseTo((70 * Math.PI) / 180);
  });

  it('falls back to the first slash for a strip without a measured tip', () => {
    expect(spearTipOf({ id: 'XX', sprite: ['win', 1] })).toEqual(spearTipOf({ id: 'L1' }));
  });

  it('has a tip for every attack strip, inside the hero frame', () => {
    const { frameWidth, feetX, feetY, scale } = HERO_SPRITES;
    for (const [strip, tip] of Object.entries(EMBER_SPEAR_TIPS)) {
      expect(HERO_SPRITES.frames[strip], strip).toBeGreaterThan(0);
      expect(tip.x, strip).toBeLessThanOrEqual((frameWidth - feetX) * scale);
      expect(tip.y, strip).toBeGreaterThanOrEqual(-feetY * scale);
    }
  });
});

describe('a lance aimed down', () => {
  it('keeps its full length level or rising, and stops at the floor when aimed down', () => {
    const level = lanceScale(200, 190, 0);
    expect(lanceScale(200, 190, -1)).toBe(level);
    const down = (70 * Math.PI) / 180;
    expect(lanceScale(400, 100, down)).toBe(level);
    expect(lanceScale(200, 190, down)).toBeLessThan(level);
    expect(lanceScale(200, 199, down)).toBe(lanceScale(200, 200, down));
  });
});
