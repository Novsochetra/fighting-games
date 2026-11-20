import { randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { CODE_ALPHABET, makeCode, normalizeCode } from '../../../src/parties/codes.js';

describe('party codes', () => {
  it('are six letters with no look-alikes', () => {
    for (let i = 0; i < 300; i++) {
      const code = makeCode(randomBytes, () => false);

      expect(code).toHaveLength(6);
      expect([...code].every((ch) => CODE_ALPHABET.includes(ch))).toBe(true);
      expect(code).not.toMatch(/[0O1IL]/);
    }
  });

  it('skip a code already in use', () => {
    const taken = new Set(['AAAAAA']);
    const bytes = [Buffer.alloc(6, 0), Buffer.alloc(6, 1)];

    expect(
      makeCode(
        () => bytes.shift(),
        (code) => taken.has(code),
      ),
    ).toBe('BBBBBB');
  });

  it('give up when every try is taken', () => {
    expect(() => makeCode(randomBytes, () => true)).toThrow('busy');
  });

  it('are read however a friend typed them', () => {
    expect(normalizeCode(' k7q m2p ')).toBe('K7QM2P');
    expect(normalizeCode('k7q-m2p')).toBe('K7QM2P');
  });

  it('refuse a letter that is never in a code', () => {
    expect(() => normalizeCode('K7QM2O')).toThrow('bad-code');
    expect(() => normalizeCode('K7QM2')).toThrow('bad-code');
    expect(() => normalizeCode(42)).toThrow('bad-code');
  });
});
