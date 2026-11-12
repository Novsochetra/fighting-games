import { describe, expect, it } from 'vitest';
import { RIEL } from '../../../src/data/currency.js';
import { formatMoney, formatNumber, grouped, toKhmerDigits } from '../../../src/lib/numerals.js';

describe('numerals', () => {
  it('groups thousands with commas', () => {
    expect(grouped(0)).toBe('0');
    expect(grouped(900)).toBe('900');
    expect(grouped(1500)).toBe('1,500');
    expect(grouped(100000)).toBe('100,000');
    expect(grouped(6000000)).toBe('6,000,000');
  });

  it('writes every digit in Khmer and leaves the rest', () => {
    expect(toKhmerDigits('0123456789')).toBe('០១២៣៤៥៦៧៨៩');
    expect(toKhmerDigits('12,500')).toBe('១២,៥០០');
  });

  it('formats a number in the numerals asked for', () => {
    expect(formatNumber(12500, 'latin')).toBe('12,500');
    expect(formatNumber(12500, 'khmer')).toBe('១២,៥០០');
  });

  it('puts the riel sign after the amount', () => {
    expect(formatMoney(1500, 'latin', RIEL)).toBe('1,500៛');
    expect(formatMoney(1500, 'khmer', RIEL)).toBe('១,៥០០៛');
  });
});
