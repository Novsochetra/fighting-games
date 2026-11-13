import { describe, expect, it } from 'vitest';
import { randomId } from '@/utils/random-id.js';

const VERSION_4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('randomId', () => {
  it('takes the browser’s own random UUID where it has one', () => {
    expect(randomId({ randomUUID: () => 'from-the-browser' })).toBe('from-the-browser');
  });

  it('makes a version-4 UUID from random bytes where it has not', () => {
    const fill = (bytes) => bytes.fill(255);

    expect(randomId({ getRandomValues: fill })).toMatch(VERSION_4);
    expect(randomId({ getRandomValues: (bytes) => bytes.fill(0) })).toMatch(VERSION_4);
  });
});
