import { describe, expect, it } from 'vitest';
import { OPERATIONS } from '../../../src/data/operations.js';
import { nextValue, rowsFor, SETTINGS_ROWS } from '../../../src/data/settings-rows.js';
import { defaultSettings, sanitizeSettings, toggledOps } from '../../../src/data/settings.js';

describe('settings', () => {
  it('starts in Khmer and Khmer numerals for a browser that reads Khmer', () => {
    expect(defaultSettings(['en-US', 'km-KH'])).toMatchObject({ lang: 'km', numerals: 'khmer' });
    expect(defaultSettings(['KM'])).toMatchObject({ lang: 'km' });
  });

  it('starts in English otherwise, every sum in the mix and all sound on', () => {
    expect(defaultSettings(['fr-FR'])).toEqual({
      sound: true,
      music: true,
      vibrate: true,
      lang: 'en',
      numerals: 'latin',
      ops: OPERATIONS,
    });
    expect(defaultSettings().lang).toBe('en');
  });

  it('keeps what was saved and fills the rest from the defaults', () => {
    const saved = { sound: false, lang: 'km', ops: ['div', 'add'] };

    expect(sanitizeSettings(saved, defaultSettings())).toEqual({
      sound: false,
      music: true,
      vibrate: true,
      lang: 'km',
      numerals: 'latin',
      ops: ['add', 'div'],
    });
  });

  it.each([null, 7, { lang: 'xx', numerals: 3, sound: 'yes', ops: ['pow'] }, { ops: [] }])(
    'reads broken saved settings (%j) as the defaults',
    (saved) => {
      expect(sanitizeSettings(saved, defaultSettings())).toEqual(defaultSettings());
    },
  );

  it('takes a sum out of the mix and puts it back in its place', () => {
    expect(toggledOps(OPERATIONS, 'sub')).toEqual(['add', 'mul', 'div']);
    expect(toggledOps(['add', 'div'], 'sub')).toEqual(['add', 'sub', 'div']);
  });

  it('leaves the last sum in the mix, as a run needs something to ask', () => {
    expect(toggledOps(['mul'], 'mul')).toEqual(['mul']);
  });

  it('steps a row through its values and round again', () => {
    const lang = SETTINGS_ROWS.find((row) => row.key === 'lang');

    expect(nextValue(lang, 'km')).toBe('en');
    expect(nextValue(lang, 'en')).toBe('km');
  });

  it('shows Vibration only on a phone that can buzz', () => {
    expect(rowsFor({ buzz: false }).map((row) => row.key)).not.toContain('vibrate');
    expect(rowsFor({ buzz: true }).map((row) => row.key)).toContain('vibrate');
  });
});
