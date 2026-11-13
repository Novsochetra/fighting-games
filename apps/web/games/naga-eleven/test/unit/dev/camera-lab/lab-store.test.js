import { afterEach, describe, expect, it } from 'vitest';

import { loadLab, saveLab } from '../../../../dev/camera-lab/src/lab-store.js';
import { EDITABLE, editsOf, resetValue } from '../../../../dev/camera-lab/src/shot-lists.js';
import { CLASH_SHOTS } from '../../../../src/data/shots.js';

const memory = () => {
  const store = new Map();

  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
  };
};

const throwing = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
};

afterEach(() => Object.keys(EDITABLE).forEach(resetValue));

describe("the camera lab's memory", () => {
  it('brings back the settings and the shots changed, laid into the game again', () => {
    const storage = memory();
    const shots = [{ from: 0, on: 'impact', step: 2 }];

    CLASH_SHOTS.splice(0, CLASH_SHOTS.length, ...shots);
    saveLab(storage, { scene: 'clash' });
    resetValue('clash');

    expect(loadLab(storage)).toEqual({ scene: 'clash' });
    expect(CLASH_SHOTS).toEqual(shots);
  });

  it('passes over a change to a list it no longer has, or one that reads wrong', () => {
    const storage = memory();

    storage.setItem(
      'naga-eleven/camera-lab',
      JSON.stringify({ edits: { gone: [], clash: [{ from: 5, on: 'x', step: 9 }] } }),
    );

    expect(loadLab(storage)).toBeNull();
    expect(editsOf()).toEqual({});
  });

  it('plays on with storage that throws or none at all', () => {
    expect(loadLab(throwing)).toBeNull();
    expect(loadLab(null)).toBeNull();
    expect(() => saveLab(throwing, {})).not.toThrow();
  });
});
