import { describe, expect, it } from 'vitest';
import {
  AVATAR_PALETTES,
  formatCount,
  formatDay,
  formatMoney,
  initialsOf,
  paletteOf,
} from '../../../src/supporters/format.js';

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

describe('initialsOf', () => {
  it('takes the first letter of the first two words', () => {
    expect(initialsOf('sok dara chan')).toBe('SD');
    expect(initialsOf('Mey')).toBe('M');
  });

  it('keeps a letter whole when it is made of several code points', () => {
    expect(initialsOf('\u179f\u17bb\u1781 \u178a\u17b6\u179a\u17b6')).toBe(
      '\u179f\u17bb\u178a\u17b6',
    );
  });
});

describe('paletteOf', () => {
  it('gives the same name the same color', () => {
    const color = paletteOf({ name: 'Sok Dara', isAnonymous: false });
    expect(paletteOf({ name: 'Sok Dara', isAnonymous: false })).toBe(color);
    expect(color).toBeGreaterThanOrEqual(1);
    expect(color).toBeLessThanOrEqual(AVATAR_PALETTES);
  });

  it('spreads names over every color', () => {
    const names = Array.from({ length: 60 }, (_, i) => `Supporter ${i}`);
    const colors = new Set(names.map((name) => paletteOf({ name, isAnonymous: false })));
    expect(colors.size).toBe(AVATAR_PALETTES);
  });

  it('keeps anonymous supporters gray', () => {
    expect(paletteOf({ name: 'Anonymous', isAnonymous: true })).toBe(0);
  });
});
