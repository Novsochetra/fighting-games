import { describe, expect, it } from 'vitest';
import { loadSaved, persistencePorts } from '../../../src/platform/persistence.js';
import { readJson, writeJson } from '../../../src/platform/storage.js';

function memoryStorage(entries = {}) {
  const data = new Map(Object.entries(entries));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    data,
  };
}

const brokenStorage = {
  getItem() {
    throw new Error('blocked');
  },
  setItem() {
    throw new Error('blocked');
  },
};

describe('storage', () => {
  it('falls back when storage is blocked or holds bad data', () => {
    expect(readJson(brokenStorage, 'key', { safe: true })).toEqual({ safe: true });
    expect(readJson(memoryStorage({ key: '{oops' }), 'key', 1)).toBe(1);
    expect(writeJson(brokenStorage, 'key', 1)).toBe(false);
  });

  it('loads old saved settings and records', () => {
    const storage = memoryStorage({
      sd_settings: '{"btn":2,"music":20}',
      sd_best: '17',
      sd_best_score: 'x',
    });
    const saved = loadSaved(storage, false);
    expect(saved.settings).toMatchObject({ buttonSize: 2, music: 20, sfx: 80 });
    expect(saved.records).toEqual({ bestCombo: 17, bestScore: 0, bestMission: 1 });
    expect(saved.hintsSeen).toEqual({});
  });

  it('saves through the ports', () => {
    const storage = memoryStorage();
    const ports = persistencePorts(storage);
    ports.saveRecords({ bestCombo: 3, bestScore: 900, bestMission: 4 });
    ports.saveHints({ move: 1 });
    expect(storage.data.get('sd_best_score')).toBe('900');
    expect(loadSaved(storage, false).records.bestMission).toBe(4);
    expect(storage.data.get('sd_hints')).toBe('{"move":1}');
  });
});
