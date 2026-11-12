import { describe, expect, it } from 'vitest';
import { loadSave, storeSave } from '../../../src/platform/save.js';
import { NO_RECORDS } from '../../../src/sim/records.js';

function memoryStorage(entries = {}) {
  const data = new Map(Object.entries(entries));

  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
}

describe('the save', () => {
  it('starts a new player with no records, in their browser’s language', () => {
    const save = loadSave(memoryStorage(), ['km-KH']);

    expect(save.records).toEqual(NO_RECORDS);
    expect(save.settings).toMatchObject({ lang: 'km', numerals: 'khmer' });
  });

  it('brings back the records and settings it stored', () => {
    const storage = memoryStorage();
    const records = { best: 42000, bestServed: 31, plays: 9 };
    const settings = { ...loadSave(storage, []).settings, total: 'always', ops: ['add', 'mul'] };

    storeSave(storage, { records, settings });

    expect(loadSave(storage, ['km'])).toEqual({ records, settings });
  });

  it.each(['{oops', '7', 'null', '{"records":[],"settings":"loud"}'])(
    'starts afresh from a broken save (%s)',
    (stored) => {
      const save = loadSave(memoryStorage({ kit_luy: stored }), []);

      expect(save.records).toEqual(NO_RECORDS);
      expect(save.settings.lang).toBe('en');
    },
  );

  it('plays on with no storage at all, forgetting between visits', () => {
    expect(loadSave(null, []).records).toEqual(NO_RECORDS);
    expect(storeSave(null, { records: NO_RECORDS, settings: {} })).toBe(false);
  });
});
