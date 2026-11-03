import { describe, expect, it } from 'vitest';
import { createLru } from '../../../../src/render/portraits/lru.js';

describe('the portrait store', () => {
  it('forgets what was used longest ago', () => {
    const store = createLru(2);

    store.set('a', 1);
    store.set('b', 2);
    store.get('a');
    store.set('c', 3);

    expect(store.get('a')).toBe(1);
    expect(store.get('b')).toBeUndefined();
    expect(store.size).toBe(2);
  });
});
