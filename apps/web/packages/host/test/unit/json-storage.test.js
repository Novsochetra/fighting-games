import { describe, expect, it } from 'vitest';
import { readJson, writeJson } from '../../src/json-storage.js';

function memoryStorage(entries = {}) {
  const data = new Map(Object.entries(entries));

  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
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

describe('json storage', () => {
  it('reads back what it wrote', () => {
    const storage = memoryStorage();

    expect(writeJson(storage, 'key', { best: 4200 })).toBe(true);
    expect(readJson(storage, 'key', null)).toEqual({ best: 4200 });
  });

  it('gives the fallback for a key never written', () => {
    expect(readJson(memoryStorage(), 'key', { safe: true })).toEqual({ safe: true });
  });

  it('falls back when storage is blocked or holds bad data', () => {
    expect(readJson(brokenStorage, 'key', { safe: true })).toEqual({ safe: true });
    expect(readJson(memoryStorage({ key: '{oops' }), 'key', 1)).toBe(1);
    expect(writeJson(brokenStorage, 'key', 1)).toBe(false);
  });
});
