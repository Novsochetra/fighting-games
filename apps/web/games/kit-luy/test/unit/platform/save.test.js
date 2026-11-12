import { describe, expect, it } from 'vitest';
import { loadSave, storeSave } from '../../../src/platform/save.js';
import { NO_RECORDS } from '../../../src/sim/records.js';

const NONE = { money: NO_RECORDS, keypad: NO_RECORDS };

function memoryStorage(entries = {}) {
  const data = new Map(Object.entries(entries));

  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
}

describe('the save', () => {
  it('starts a new player with no records in either way of answering, in their language', () => {
    const save = loadSave(memoryStorage(), ['km-KH']);

    expect(save.records).toEqual(NONE);
    expect(save.settings).toMatchObject({ lang: 'km', numerals: 'khmer', input: 'money' });
  });

  it('brings back the records of each way of answering and the settings it stored', () => {
    const storage = memoryStorage();
    const records = {
      money: { best: 42000, bestServed: 31, plays: 9 },
      keypad: { best: 61000, bestServed: 40, plays: 2 },
    };
    const settings = { ...loadSave(storage, []).settings, input: 'keypad', ops: ['add', 'mul'] };

    storeSave(storage, { records, settings });

    expect(loadSave(storage, ['km'])).toEqual({ records, settings });
  });

  it('reads the records saved before there were two ways of answering as counting money', () => {
    const saved = { records: { best: 30000, bestServed: 12, plays: 4 } };
    const save = loadSave(memoryStorage({ kit_luy: JSON.stringify(saved) }), []);

    expect(save.records).toEqual({ money: saved.records, keypad: NO_RECORDS });
  });

  it.each(['{oops', '7', 'null', '{"records":[],"settings":"loud"}'])(
    'starts afresh from a broken save (%s)',
    (stored) => {
      const save = loadSave(memoryStorage({ kit_luy: stored }), []);

      expect(save.records).toEqual(NONE);
      expect(save.settings.lang).toBe('en');
    },
  );

  it('plays on with no storage at all, forgetting between visits', () => {
    expect(loadSave(null, []).records).toEqual(NONE);
    expect(storeSave(null, { records: NONE, settings: {} })).toBe(false);
  });
});
