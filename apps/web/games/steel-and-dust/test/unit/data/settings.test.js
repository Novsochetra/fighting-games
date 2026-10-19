import { describe, expect, it } from 'vitest';
import { difficultyOf } from '../../../src/data/difficulty.js';
import { buttonScale, defaultSettings, migrateSettings } from '../../../src/data/settings.js';

describe('settings data', () => {
  it('turns auto-aim on by default only on touch screens', () => {
    expect(defaultSettings(true).aim).toBe(true);
    expect(defaultSettings(false).aim).toBe(false);
  });

  it('reads settings saved under the old key names', () => {
    expect(migrateSettings({ btn: 2, autoAtk: false, music: 30 })).toEqual({
      buttonSize: 2,
      holdToCombo: false,
      music: 30,
    });
  });

  it('maps button size to a scale with a safe fallback', () => {
    expect(buttonScale({ buttonSize: 0 })).toBe(0.82);
    expect(buttonScale({ buttonSize: 9 })).toBe(1);
  });

  it('falls back to Normal for an unknown difficulty', () => {
    expect(difficultyOf({ difficulty: 0 }).name).toBe('Easy');
    expect(difficultyOf({ difficulty: 7 }).name).toBe('Normal');
  });
});
