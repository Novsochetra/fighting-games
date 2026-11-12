import { describe, expect, it } from 'vitest';
import { COIN_FACE, COIN_SPIN } from '../../../src/art/coin.js';
import { COIN, PIGGY } from '../../../src/art/palette.js';
import { PIGGY_SIZE, piggyRows } from '../../../src/art/piggy.js';

const MOODS = ['idle', 'blink', 'happy', 'sad'];
const lettersOf = (rows) => new Set(rows.join('').replaceAll('.', ''));

describe('the pixel art', () => {
  it.each(MOODS)('draws the %s pig in rows of one width, at its size', (mood) => {
    const rows = piggyRows(mood);

    expect(rows).toHaveLength(PIGGY_SIZE.height);
    expect(new Set(rows.map((row) => row.length))).toEqual(new Set([PIGGY_SIZE.width]));
  });

  it.each(MOODS)('paints the %s pig only in colours of its palette', (mood) => {
    for (const letter of lettersOf(piggyRows(mood))) {
      expect(PIGGY[letter], letter).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('gives every mood a face of its own, and an unknown mood the idle one', () => {
    const faces = MOODS.map((mood) => piggyRows(mood).join('\n'));

    expect(new Set(faces).size).toBe(MOODS.length);
    expect(piggyRows('dancing')).toEqual(piggyRows('idle'));
  });

  it('draws the coin square, in its palette', () => {
    expect(COIN_FACE.every((row) => row.length === COIN_FACE.length)).toBe(true);

    for (const letter of lettersOf(COIN_FACE)) {
      expect(COIN[letter], letter).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('spins the coin through columns it has, down to its edge and back', () => {
    const widths = COIN_SPIN.map((columns) => columns.length);

    expect(widths).toEqual([7, 5, 3, 1, 3, 5]);
    expect(COIN_SPIN.flat().every((column) => column >= 0 && column < COIN_FACE.length)).toBe(true);
  });
});
