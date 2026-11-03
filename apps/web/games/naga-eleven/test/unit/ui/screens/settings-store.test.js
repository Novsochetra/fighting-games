import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  preferredLang,
  readSettings,
  SETTINGS_KEY,
  stepSetting,
  writeSettings,
} from '../../../../src/ui/screens/settings-store.js';
import { fakeStorage, throwingStorage } from '../../../support/screen-fixtures.js';

const stored = (value) => fakeStorage({ [SETTINGS_KEY]: value });

describe('the settings kept', () => {
  it('starts from the defaults with nothing kept', () => {
    expect(readSettings(fakeStorage())).toEqual(DEFAULT_SETTINGS);
  });

  it('starts in the language the device prefers until one is picked', () => {
    expect(readSettings(fakeStorage(), { lang: 'km' }).lang).toBe('km');
    expect(readSettings(stored('{"lang":"en"}'), { lang: 'km' }).lang).toBe('en');
  });

  it('keeps each value it knows and drops the rest', () => {
    const settings = readSettings(stored('{"sound":0,"music":11,"touch":"maybe","extra":1}'));

    expect(settings).toEqual({ ...DEFAULT_SETTINGS, sound: 0 });
  });

  it.each(['not json', 'null', '7', '[1,2]'])('starts afresh from a broken record: %s', (text) => {
    expect(readSettings(stored(text))).toEqual(DEFAULT_SETTINGS);
  });

  it('starts afresh when the storage throws, or is not there', () => {
    expect(readSettings(throwingStorage)).toEqual(DEFAULT_SETTINGS);
    expect(readSettings(null)).toEqual(DEFAULT_SETTINGS);
  });

  it('writes the settings, and says when it could not', () => {
    const storage = fakeStorage();

    expect(writeSettings(storage, { ...DEFAULT_SETTINGS, sound: 2 })).toBe(true);
    expect(readSettings(storage).sound).toBe(2);
    expect(writeSettings(throwingStorage, DEFAULT_SETTINGS)).toBe(false);
    expect(writeSettings(null, DEFAULT_SETTINGS)).toBe(false);
  });
});

describe('stepping a setting', () => {
  it('stops a volume at its ends', () => {
    expect(stepSetting({ sound: 10 }, 'sound', 1).sound).toBe(10);
    expect(stepSetting({ music: 0 }, 'music', -1).music).toBe(0);
    expect(stepSetting({ music: 4 }, 'music', 1).music).toBe(5);
  });

  it('takes a choice round from the last to the first, both ways', () => {
    expect(stepSetting({ touch: 'off' }, 'touch', 1).touch).toBe('auto');
    expect(stepSetting({ touch: 'auto' }, 'touch', -1).touch).toBe('off');
    expect(stepSetting({ lang: 'en' }, 'lang', 1).lang).toBe('km');
  });

  it('leaves the settings as they were for a key it does not know', () => {
    const settings = { ...DEFAULT_SETTINGS };

    expect(stepSetting(settings, 'speed', 1)).toBe(settings);
  });
});

describe('the language a device prefers', () => {
  it('is Khmer when any of its languages is', () => {
    expect(preferredLang({ languages: ['en-US', 'km-KH'] })).toBe('km');
    expect(preferredLang({ language: 'km' })).toBe('km');
  });

  it('is English otherwise, or with no navigator', () => {
    expect(preferredLang({ languages: ['fr-FR', 'kmr'] })).toBe('en');
    expect(preferredLang(undefined)).toBe('en');
  });
});
