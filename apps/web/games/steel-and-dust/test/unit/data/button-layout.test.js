import { describe, expect, it } from 'vitest';
import {
  clampCentre,
  LAYOUT_CONTROLS,
  sanitizeButtonLayout,
  steppedSize,
} from '../../../src/data/button-layout.js';
import { defaultSettings, migrateSettings } from '../../../src/data/settings.js';

const entries = (overrides = {}) => ({
  ult: { x: 0.6, y: 0.6, size: 1 },
  dash: { x: 0.7, y: 0.6, size: 1 },
  jump: { x: 0.9, y: 0.5, size: 1.2 },
  heavy: { x: 0.75, y: 0.8, size: 1 },
  light: { x: 0.2, y: 0.8, size: 0.8 },
  stick: { x: 0.85, y: 0.7, size: 1.3 },
  ...overrides,
});

describe('button layout sizes', () => {
  it('step by a tenth between 60% and 180%', () => {
    expect(steppedSize(1, 1)).toBe(1.1);
    expect(steppedSize(1.1, 1)).toBe(1.2);
    expect(steppedSize(0.7, -1)).toBe(0.6);
    expect(steppedSize(0.6, -1)).toBe(0.6);
    expect(steppedSize(1.8, 1)).toBe(1.8);
  });

  it('never drift off the tenths', () => {
    let size = 0.6;
    for (let i = 0; i < 12; i++) {
      size = steppedSize(size, 1);
    }
    expect(size).toBe(1.8);
  });
});

describe('a button centre on the touch layer', () => {
  it('keeps the whole button on the layer', () => {
    const half = { x: 0.05, y: 0.1 };
    expect(clampCentre({ x: 0.01, y: 0.5 }, half)).toEqual({ x: 0.05, y: 0.5 });
    expect(clampCentre({ x: 0.5, y: 0.99 }, half)).toEqual({ x: 0.5, y: 0.9 });
    expect(clampCentre({ x: 0.3, y: 0.4 }, half)).toEqual({ x: 0.3, y: 0.4 });
  });

  it('centres a button wider than the layer', () => {
    expect(clampCentre({ x: 0.1, y: 0.2 }, { x: 0.6, y: 0.1 })).toEqual({ x: 0.5, y: 0.2 });
  });
});

describe('a saved button layout', () => {
  it('keeps a whole layout for each orientation', () => {
    const saved = { landscape: entries(), portrait: null };
    expect(sanitizeButtonLayout(saved)).toEqual(saved);
    expect(Object.keys(sanitizeButtonLayout(saved).landscape)).toEqual(LAYOUT_CONTROLS);
    expect(LAYOUT_CONTROLS).toEqual(['light', 'heavy', 'jump', 'dash', 'ult', 'stick']);
  });

  it('drops an orientation that misses a control or holds bad numbers', () => {
    const missingUlt = entries();
    delete missingUlt.ult;
    const portrait = entries();
    expect(sanitizeButtonLayout({ landscape: missingUlt, portrait })).toEqual({
      landscape: null,
      portrait,
    });
    const missingStick = entries();
    delete missingStick.stick;
    expect(sanitizeButtonLayout({ landscape: missingStick, portrait: null })).toBeNull();
    const badStick = entries({ stick: { x: 0.5, y: -0.1, size: 1 } });
    expect(sanitizeButtonLayout({ landscape: badStick, portrait: null })).toBeNull();
    const outside = entries({ dash: { x: 1.4, y: 0.5, size: 1 } });
    expect(sanitizeButtonLayout({ landscape: outside, portrait: null })).toBeNull();
    const notANumber = entries({ jump: { x: '0.5', y: 0.5, size: 1 } });
    expect(sanitizeButtonLayout({ landscape: notANumber, portrait: null })).toBeNull();
    const noSize = entries({ heavy: { x: 0.5, y: 0.5, size: null } });
    expect(sanitizeButtonLayout({ landscape: noSize, portrait: null })).toBeNull();
  });

  it('snaps sizes onto the steps it can be set to', () => {
    const saved = { landscape: entries({ light: { x: 0.2, y: 0.8, size: 9 } }) };
    expect(sanitizeButtonLayout(saved).landscape.light.size).toBe(1.8);
    const odd = { portrait: entries({ ult: { x: 0.2, y: 0.8, size: 1.23 } }) };
    expect(sanitizeButtonLayout(odd).portrait.ult.size).toBe(1.2);
  });

  it('falls back to the original layout for anything else', () => {
    for (const value of [null, undefined, 3, 'custom', [], {}, { landscape: 'x' }]) {
      expect(sanitizeButtonLayout(value)).toBeNull();
    }
  });

  it('is the original layout by default and is checked when settings load', () => {
    expect(defaultSettings(true).buttonLayout).toBeNull();
    expect(migrateSettings({ buttonLayout: { landscape: { light: 1 } } })).toEqual({
      buttonLayout: null,
    });
    const saved = { landscape: null, portrait: entries() };
    expect(migrateSettings({ buttonLayout: saved }).buttonLayout).toEqual(saved);
    expect(migrateSettings({ music: 10 })).toEqual({ music: 10 });
  });
});
