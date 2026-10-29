import { describe, expect, it } from 'vitest';
import { hasOwn } from '../../../src/lib/objects.js';

describe('object helpers', () => {
  it('names only the keys an object holds itself, not the ones it inherits', () => {
    const sounds = { hit: 1, swing: undefined };

    expect(hasOwn(sounds, 'hit')).toBe(true);
    expect(hasOwn(sounds, 'swing')).toBe(true);
    expect(hasOwn(sounds, 'toString')).toBe(false);
    expect(hasOwn(sounds, 'constructor')).toBe(false);
    expect(hasOwn(sounds, 'miss')).toBe(false);
  });

  it('works on an object with no prototype', () => {
    const bare = Object.assign(Object.create(null), { hit: 1 });

    expect(hasOwn(bare, 'hit')).toBe(true);
  });
});
