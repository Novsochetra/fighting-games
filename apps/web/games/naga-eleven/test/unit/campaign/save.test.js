import { describe, expect, it } from 'vitest';
import { heroAtLevel } from '../../../src/campaign/levels.js';
import { loadSave, newSave, storeSave } from '../../../src/campaign/save.js';
import { DEFAULT_SEED, SAVE_KEY, SAVE_VERSION } from '../../../src/campaign/save-format.js';
import { memoryStorage } from '../../support/campaign-fixtures.js';

const brokenStorage = () => ({
  getItem() {
    throw new Error('blocked');
  },

  setItem() {
    throw new Error('full');
  },
});

describe('a new save', () => {
  it('starts at the first stage of the first chapter with a level 1 hero', () => {
    expect(newSave()).toEqual({
      version: SAVE_VERSION,
      chapter: 0,
      stage: 0,
      hero: heroAtLevel(1),
      cups: {},
      flags: {},
      seed: DEFAULT_SEED,
      attempts: 0,
    });
  });

  it('takes the seed it is given, as a uint32', () => {
    expect(newSave({ seed: 42 }).seed).toBe(42);
    expect(newSave({ seed: -1 }).seed).toBe(2 ** 32 - 1);
  });
});

describe('storing and loading', () => {
  it("keeps the save under the game's key and reads it back the same", () => {
    const storage = memoryStorage();
    const save = {
      ...newSave({ seed: 5 }),
      chapter: 2,
      stage: 3,
      flags: { 'met:japan-youth': true },
    };

    expect(storeSave(storage, save)).toBe(true);
    expect([...storage.items.keys()]).toEqual([SAVE_KEY]);
    expect(SAVE_KEY).toBe('naga-eleven/save');
    expect(loadSave(storage)).toEqual(save);
  });

  it('starts afresh when nothing is stored', () => {
    expect(loadSave(memoryStorage())).toEqual(newSave());
    expect(loadSave(memoryStorage(), { seed: 3 })).toEqual(newSave({ seed: 3 }));
    expect(loadSave(undefined)).toEqual(newSave());
  });

  it('starts afresh when what is stored is not a save', () => {
    for (const text of ['{not json', '42', '"text"', '[1,2]', 'null']) {
      expect(loadSave(memoryStorage({ [SAVE_KEY]: text }))).toEqual(newSave());
    }
  });

  it('survives a storage that throws', () => {
    expect(loadSave(brokenStorage())).toEqual(newSave());
    expect(storeSave(brokenStorage(), newSave())).toBe(false);
  });
});
