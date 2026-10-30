import { describe, expect, it } from 'vitest';
import { formatClock, formatCount, formatDay, formatMoney } from '@/utils/format.js';

const dollars = { currency: 'USD', locale: 'en-US' };

describe('formatMoney', () => {
  it('drops the cents from a whole amount', () => {
    expect(formatMoney(50, dollars)).toBe('$50');
    expect(formatMoney(1250, dollars)).toBe('$1,250');
  });

  it('shows the cents when there are some', () => {
    expect(formatMoney(4.99, dollars)).toBe('$4.99');
    expect(formatMoney(4.5, dollars)).toBe('$4.50');
  });

  it('writes other currencies in their own way', () => {
    expect(formatMoney(20, { currency: 'EUR', locale: 'de-DE' })).toBe('20\u00a0€');
  });
});

describe('formatCount and formatDay', () => {
  it('groups big counts', () => {
    expect(formatCount(1200, 'en-US')).toBe('1,200');
  });

  it('writes a short date and keeps the calendar day in any time zone', () => {
    expect(formatDay('2026-10-01', 'en-US')).toBe('Oct 1, 2026');
  });

  it('writes nothing for a missing day', () => {
    expect(formatDay('', 'en-US')).toBe('');
  });
});

describe('formatting a run', () => {
  it('writes the score, the clock and the day', () => {
    expect(formatCount(1234567, 'en-US')).toBe('1,234,567');
    expect(formatClock(59)).toBe('0:59');
    expect(formatClock(3600)).toBe('1:00:00');
    expect(formatDay('2026-11-02', 'en-US', { withYear: false })).toBe('Nov 2');
  });
});
