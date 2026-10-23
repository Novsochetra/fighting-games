import { describe, expect, it } from 'vitest';
import { SOUND_DEFINITIONS } from '../../../src/audio/bank/definitions.js';
import { BIG, hitPair, NORMAL } from '../../../src/audio/bank/hit-size.js';
import { GROUP_CAPS } from '../../../src/audio/bank/voice-pool.js';

describe('hitPair', () => {
  it('makes a hit and its big version, longer and lower, from one builder', () => {
    const calls = [];
    const pair = hitPair('clang', {
      level: 0.5,
      bigLevel: 0.7,
      seconds: 0.4,
      build: (track, pitch, size) => calls.push({ pitch, size }),
    });
    expect(Object.keys(pair)).toEqual(['clang', 'clangBig']);
    expect(pair.clang).toMatchObject({ group: 'hit', level: 0.5, takes: 4, seconds: 0.4 });
    expect(pair.clangBig).toMatchObject({ group: 'hit', level: 0.7, seconds: 0.54 });
    pair.clangBig.build(null, 1.02);
    expect(calls).toEqual([{ pitch: 1.02, size: BIG }]);
    expect(BIG.length).toBeGreaterThan(NORMAL.length);
    expect(BIG.tune).toBeLessThan(NORMAL.tune);
  });
});

describe('the weapon hits and the ultimate in the bank', () => {
  it('has a normal and a big hit for every weapon', () => {
    for (const key of ['blade', 'heavy', 'blunt', 'pierce']) {
      expect(SOUND_DEFINITIONS[key].group).toBe('hit');
      expect(SOUND_DEFINITIONS[`${key}Big`].group).toBe('hit');
    }
  });

  it('plays the ultimate in a group of its own that outranks the hits', () => {
    for (const key of ['ult', 'ultEnd']) {
      expect(SOUND_DEFINITIONS[key]).toMatchObject({ group: 'ult', priority: 3, takes: 1 });
    }
    expect(GROUP_CAPS.ult).toBe(2);
    expect(SOUND_DEFINITIONS.ult.priority).toBeGreaterThan(SOUND_DEFINITIONS.blade.priority);
  });
});
