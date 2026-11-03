import { describe, expect, it } from 'vitest';
import { hashOf, mixOf, pickerOf } from '../../../../../src/render/portraits/cast/seeded.js';

describe('seeded picks', () => {
  it('hash the same text to the same whole number every time', () => {
    expect(hashOf('royal-kids:0')).toBe(hashOf('royal-kids:0'));
    expect(hashOf('royal-kids:0')).not.toBe(hashOf('royal-kids:1'));
    expect(Number.isInteger(hashOf('brazil:3'))).toBe(true);
    expect(hashOf('brazil:3')).toBeGreaterThanOrEqual(0);
  });

  it('pick the same item for a seed and a salt, without Math.random', () => {
    const list = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const first = pickerOf('japan-youth:4');
    const again = pickerOf('japan-youth:4');

    for (const salt of ['eyes', 'nose', 'mouth', 'hair']) {
      expect(first(list, salt)).toBe(again(list, salt));
      expect(list).toContain(first(list, salt));
    }
  });

  it('spread the picks over the whole list', () => {
    const list = ['a', 'b', 'c', 'd', 'e'];
    const picked = new Set(
      Array.from({ length: 60 }, (_, place) => pickerOf(`nigeria:${place}`)(list, 'eyes')),
    );

    expect(picked.size).toBe(list.length);
  });

  it('give every place of a side its own mix of parts, the same each time', () => {
    const parts = { hair: ['a', 'b', 'c'], eyes: ['d', 'e'], nose: ['f', 'g'] };
    const mixes = Array.from({ length: 11 }, (_, place) =>
      JSON.stringify(mixOf(parts, { seed: 'kampot-high', place })),
    );

    expect(new Set(mixes).size).toBe(11);
    expect(mixOf(parts, { seed: 'kampot-high', place: 4 })).toEqual(JSON.parse(mixes[4]));
    expect(Object.keys(JSON.parse(mixes[0]))).toEqual(['hair', 'eyes', 'nose']);
  });
});
