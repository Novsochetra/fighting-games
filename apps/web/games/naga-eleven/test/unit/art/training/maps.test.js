import { describe, expect, it } from 'vitest';
import { COACH_MAP } from '../../../../src/art/training/coach.js';
import { MANNEQUIN_MAP } from '../../../../src/art/training/mannequin.js';
import { MEDITATOR } from '../../../../src/art/training/meditator.js';

const MAPS = { meditator: MEDITATOR, coach: COACH_MAP, mannequin: MANNEQUIN_MAP };

const HEX = /^#[0-9a-f]{6}$/i;

// every painted pixel that meets the bare ground round the figure, or the map's edge
function edgeKeys({ rows }) {
  const keyAt = (x, y) => rows[y]?.[x] ?? '.';
  const keys = new Set();

  rows.forEach((row, y) => {
    [...row].forEach((key, x) => {
      const bare = [keyAt(x - 1, y), keyAt(x + 1, y), keyAt(x, y - 1), keyAt(x, y + 1)];

      if (key !== '.' && bare.includes('.')) {
        keys.add(key);
      }
    });
  });

  return keys;
}

describe.each(Object.entries(MAPS))('the %s, drawn by hand', (_, map) => {
  it('is a rectangle of rows, every letter in its palette and every colour a hex', () => {
    const width = map.rows[0].length;

    for (const row of map.rows) {
      expect(row).toHaveLength(width);

      for (const key of row.replaceAll('.', '')) {
        expect(map.palette[key]).toMatch(HEX);
      }
    }
  });

  it('stands its anchor on its bottom row, across its middle', () => {
    expect(map.anchor.y).toBe(map.rows.length);
    expect(map.anchor.x).toBeGreaterThan(map.rows[0].length / 3);
    expect(map.anchor.x).toBeLessThan((map.rows[0].length * 2) / 3);
  });

  it('is outlined all round, as the footballer sheets are', () => {
    expect([...edgeKeys(map)]).toEqual(['0']);
  });
});
