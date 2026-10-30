import { describe, expect, it } from 'vitest';
import { AVATAR_PALETTES, initialsOf, paletteOf } from '@/screens/supporters/avatar.js';

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
