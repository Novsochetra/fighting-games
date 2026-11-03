import { describe, expect, it } from 'vitest';
import {
  fontFor,
  KHMER_MIN_SIZE,
  khmerRoom,
  lettersOf,
  numberIn,
  sizeFor,
} from '../../../src/render/text.js';

describe('the words drawn on the canvas', () => {
  it('sets small Khmer at the smallest size its marks read at, and leaves the pixel face be', () => {
    expect(sizeFor('សុចិត្រា', 8)).toBe(KHMER_MIN_SIZE);
    expect(sizeFor('សុចិត្រា', 24)).toBe(24);
    expect(sizeFor('SOCHETRA', 8)).toBe(8);
    expect(fontFor('សុចិត្រា', { size: 8 })).toMatch(/^400 12px .*Khmer/);
    expect(fontFor('SOCHETRA', { size: 8 })).toMatch(/^400 8px Silkscreen/);
  });

  it('gives a Khmer line a few more rows than a pixel-font one', () => {
    expect(khmerRoom('ហារូតូ')).toBeGreaterThan(0);
    expect(khmerRoom('HARUTO')).toBe(0);
  });

  it('moves an English word letter by letter and a Khmer word whole', () => {
    expect(lettersOf('GOAL!')).toEqual(['G', 'O', 'A', 'L', '!']);
    expect(lettersOf('បាល់ចូល!')).toEqual(['បាល់ចូល!']);
  });

  it('writes numbers in the digits of the language', () => {
    expect(numberIn(2026, 'km')).toBe('២០២៦');
    expect(numberIn('1.5', 'km')).toBe('១.៥');
    expect(numberIn(7, 'en')).toBe('7');
  });
});
