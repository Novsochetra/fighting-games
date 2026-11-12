import { describe, expect, it } from 'vitest';
import { OPERATIONS } from '../../../src/data/operations.js';
import { nextValue, rowsFor, SETTINGS_ROWS } from '../../../src/data/settings-rows.js';
import { defaultSettings, sanitizeSettings, toggledOps } from '../../../src/data/settings.js';

describe('settings', () => {
  it('starts in Khmer and Khmer numerals for a browser that reads Khmer', () => {
    expect(defaultSettings(['en-US', 'km-KH'])).toMatchObject({ lang: 'km', numerals: 'khmer' });
    expect(defaultSettings(['KM'])).toMatchObject({ lang: 'km' });
  });

  it('starts in English otherwise, every sum in the mix, the total shown only at first', () => {
    expect(defaultSettings(['fr-FR'])).toEqual({
      sound: true,
      vibrate: true,
      lang: 'en',
      numerals: 'latin',
      total: 'early',
      ops: OPERATIONS,
    });
    expect(defaultSettings().lang).toBe('en');
  });

  it('keeps what was saved and fills the rest from the defaults', () => {
    const saved = { sound: false, lang: 'km', total: 'always', ops: ['div', 'add'] };

    expect(sanitizeSettings(saved, defaultSettings())).toEqual({
      sound: false,
      vibrate: true,
      lang: 'km',
      numerals: 'latin',
      total: 'always',
      ops: ['add', 'div'],
    });
  });

  it('drops a setting the game no longer has, as the first version’s music', () => {
    expect(sanitizeSettings({ music: false }, defaultSettings())).toEqual(defaultSettings());
  });

  it.each([
    null,
    7,
    { lang: 'xx', numerals: 3, sound: 'yes', total: 9, ops: ['pow'] },
    { ops: [] },
  ])('reads broken saved settings (%j) as the defaults', (saved) => {
    expect(sanitizeSettings(saved, defaultSettings())).toEqual(defaultSettings());
  });

  it('takes a sum out of the mix and puts it back in its place', () => {
    expect(toggledOps(OPERATIONS, 'sub')).toEqual(['add', 'mul', 'div']);
    expect(toggledOps(['add', 'div'], 'sub')).toEqual(['add', 'sub', 'div']);
  });

  it('leaves the last sum in the mix, as a run needs something to ask', () => {
    expect(toggledOps(['mul'], 'mul')).toEqual(['mul']);
  });

  it('steps a row through its values and round again', () => {
    const total = SETTINGS_ROWS.find((row) => row.key === 'total');

    expect(nextValue(total, 'early')).toBe('always');
    expect(nextValue(total, 'always')).toBe('early');
  });

  it('shows Vibration only on a phone that can buzz', () => {
    expect(rowsFor({ buzz: false }).map((row) => row.key)).not.toContain('vibrate');
    expect(rowsFor({ buzz: true }).map((row) => row.key)).toContain('vibrate');
  });
});
