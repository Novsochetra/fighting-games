import { describe, expect, it } from 'vitest';
import { TURN_PHONE, TURN_PHONE_PALETTE } from '../../../src/art/turn-phone.js';

describe('the turn card’s phone', () => {
  it('is a grid of whole rows, every pixel in its palette or clear', () => {
    const width = TURN_PHONE[0].length;

    for (const row of TURN_PHONE) {
      expect(row).toHaveLength(width);

      for (const key of row) {
        expect(key === '.' || key in TURN_PHONE_PALETTE, key).toBe(true);
      }
    }
  });

  it('is outlined all round, its corners cut round', () => {
    const last = TURN_PHONE.length - 1;

    expect(TURN_PHONE[0]).toMatch(/^\.\.o+\.\.$/);
    expect(TURN_PHONE[last]).toMatch(/^\.\.o+\.\.$/);

    for (const row of TURN_PHONE.slice(2, last - 1)) {
      expect(row.at(0)).toBe('o');
      expect(row.at(-1)).toBe('o');
    }
  });

  it('lights its rim from the top left and shades it to the bottom right', () => {
    const last = TURN_PHONE.length - 2;

    expect(TURN_PHONE[1]).toMatch(/^\.oL+Y+o\.$/);
    expect(TURN_PHONE[last]).toMatch(/^\.oD+o\.$/);
    expect(TURN_PHONE.slice(2, last).every((row) => row.at(-2) === 'D')).toBe(true);
  });

  it('shows a whole pitch on its screen: touchlines, goal lines and the halfway line', () => {
    const screen = TURN_PHONE.slice(3, 16).map((row) => row.slice(4, 29));
    const column = (x) => screen.map((row) => row[x]).join('');

    expect(screen.at(0)).toMatch(/^w+$/);
    expect(screen.at(-1)).toMatch(/^w+$/);

    for (const x of [0, 12, 24]) {
      expect(column(x)).toMatch(/^w+$/);
    }
  });
});
