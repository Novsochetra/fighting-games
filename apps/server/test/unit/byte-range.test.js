import { describe, expect, it } from 'vitest';
import { byteRangeOf } from '../../src/routes/byte-range.js';

describe('byteRangeOf', () => {
  it.each([
    ['bytes=0-1', { start: 0, end: 1 }],
    ['bytes=100-199', { start: 100, end: 199 }],
    ['bytes=900-', { start: 900, end: 999 }],
    ['bytes=-100', { start: 900, end: 999 }],
    ['bytes=-5000', { start: 0, end: 999 }],
    ['bytes=500-5000', { start: 500, end: 999 }],
    [' bytes=0-0 ', { start: 0, end: 0 }],
  ])('reads %s of a 1000-byte file as %o', (header, range) => {
    expect(byteRangeOf(header, 1000)).toEqual(range);
  });

  it.each(['bytes=1000-', 'bytes=1000-1999', 'bytes=-0'])(
    'answers %s with none, since the file has no such bytes',
    (header) => {
      expect(byteRangeOf(header, 1000)).toBe('none');
    },
  );

  it('finds no bytes at all in an empty file', () => {
    expect(byteRangeOf('bytes=0-', 0)).toBe('none');
    expect(byteRangeOf('bytes=-10', 0)).toBe('none');
  });

  it.each([
    undefined,
    '',
    'bytes=-',
    'bytes=5-1',
    'bytes=0-1,5-9',
    'items=0-1',
    'bytes=a-b',
    'bytes=0x10-',
  ])('sends the whole file for %s', (header) => {
    expect(byteRangeOf(header, 1000)).toBeNull();
  });
});
