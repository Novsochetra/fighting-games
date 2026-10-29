import { describe, expect, it } from 'vitest';
import { clampCentre, sanitizeButtonLayout, steppedSize } from '../../../src/data/button-layout.js';
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

// a layout saved for the Dusk skin, which steers with a d-pad
const duskEntries = () => {
  const { stick, ...buttons } = entries();
  return { ...buttons, dpad: stick };
};

describe('a saved button layout', () => {
  it('keeps a whole layout for each orientation of each skin', () => {
    const saved = {
      classic: { landscape: entries(), portrait: null },
      dusk: { landscape: null, portrait: duskEntries() },
    };
    expect(sanitizeButtonLayout(saved)).toEqual(saved);
    expect(Object.keys(sanitizeButtonLayout(saved).classic.landscape).sort()).toEqual([
      'dash',
      'heavy',
      'jump',
      'light',
      'stick',
      'ult',
    ]);
  });

  it('takes a layout saved before there were skins as the classic skin’s', () => {
    const saved = { landscape: entries(), portrait: null };
    expect(sanitizeButtonLayout(saved)).toEqual({ classic: saved });
  });

  it('drops an orientation that misses a control or holds bad numbers', () => {
    const missingUlt = entries();
    delete missingUlt.ult;
    const portrait = entries();
    expect(sanitizeButtonLayout({ classic: { landscape: missingUlt, portrait } })).toEqual({
      classic: { landscape: null, portrait },
    });
    const missingStick = entries();
    delete missingStick.stick;
    const broken = [
      missingStick,
      entries({ stick: { x: 0.5, y: -0.1, size: 1 } }),
      entries({ dash: { x: 1.4, y: 0.5, size: 1 } }),
      entries({ jump: { x: '0.5', y: 0.5, size: 1 } }),
      entries({ heavy: { x: 0.5, y: 0.5, size: null } }),
    ];
    for (const landscape of broken) {
      expect(sanitizeButtonLayout({ classic: { landscape, portrait: null } })).toBeNull();
    }
    // the stick is the classic skin's: Dusk has a d-pad there instead
    expect(sanitizeButtonLayout({ dusk: { landscape: entries() } })).toBeNull();
  });

  it('snaps sizes onto the steps it can be set to', () => {
    const saved = { classic: { landscape: entries({ light: { x: 0.2, y: 0.8, size: 9 } }) } };
    expect(sanitizeButtonLayout(saved).classic.landscape.light.size).toBe(1.8);
    const odd = { classic: { portrait: entries({ ult: { x: 0.2, y: 0.8, size: 1.23 } }) } };
    expect(sanitizeButtonLayout(odd).classic.portrait.ult.size).toBe(1.2);
  });

  it('falls back to the skins’ own layouts for anything else', () => {
    const odd = [null, undefined, 3, 'custom', [], {}, { landscape: 'x' }, { dusk: 'x' }];
    for (const value of odd) {
      expect(sanitizeButtonLayout(value)).toBeNull();
    }
  });

  it('is the skins’ own layout by default and is checked when settings load', () => {
    expect(defaultSettings(true).buttonLayout).toBeNull();
    expect(migrateSettings({ buttonLayout: { landscape: { light: 1 } } })).toEqual({
      buttonLayout: null,
    });
    const saved = { classic: { landscape: null, portrait: entries() } };
    expect(migrateSettings({ buttonLayout: saved }).buttonLayout).toEqual(saved);
    expect(migrateSettings({ music: 10 })).toEqual({ music: 10 });
  });
});
