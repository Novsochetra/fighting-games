import { describe, expect, it } from 'vitest';

import {
  DIVE_FRAMES,
  DIVE_INKS,
  DIVE_KIT_LETTERS,
} from '../../../../src/art/save-cam/keeper-dive/index.js';
import { STAMP, STAMP_CODES, stampCodes } from '../../../../src/render/actors/number-stamp.js';

const FRAMES = [
  ['set', DIVE_FRAMES.set],
  ...Object.entries(DIVE_FRAMES.push).map(([height, map]) => [`push ${height}`, map]),
  ...['high', 'mid', 'low'].flatMap((height) =>
    Object.entries(DIVE_FRAMES[height]).map(([grip, map]) => [`${height} ${grip}`, map]),
  ),
  ...Object.entries(DIVE_FRAMES.land).map(([hands, map]) => [`land ${hands}`, map]),
];

const BALL = new Set(['R', 'S', 'T', 'U', 'P', 'Q']);
const GLOVE = new Set(['G', 'H', 'I', 'J']);

const partOf = (map, x, y) => DIVE_KIT_LETTERS[map.rows[y]?.[x]]?.[0];

// the letters within `reach` of a point, with how far across and up from it each is
function around(map, { x, y }, reach) {
  return map.rows.flatMap((row, py) =>
    [...row].flatMap((letter, px) =>
      Math.hypot(px - x, py - y) <= reach ? [{ letter, dx: px - x, dy: py - y }] : [],
    ),
  );
}

describe("the keeper's front-facing dive, as pixel maps", () => {
  it.each(FRAMES)('%s is a whole map in known letters', (name, map) => {
    const width = map.rows[0].length;

    for (const row of map.rows) {
      expect(row).toHaveLength(width);

      for (const letter of row) {
        expect(letter === '.' || letter in DIVE_KIT_LETTERS || letter in DIVE_INKS, letter).toBe(
          true,
        );
      }
    }

    for (const point of [map.anchor, map.hands, map.number]) {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThan(width);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThan(map.rows.length);
    }
  });

  it.each(FRAMES)('%s has its navel on his body and the whole number on his shirt', (name, map) => {
    expect(['shirt', 'shorts']).toContain(partOf(map, map.anchor.x, map.anchor.y));

    const codes = stampCodes(88, 'chest');
    const left = map.number.x - Math.floor(STAMP.width / 2);
    const top = map.number.y - Math.floor(STAMP.height / 2);

    codes.forEach((code, i) => {
      if (code === STAMP_CODES.fill) {
        expect(partOf(map, left + (i % STAMP.width), top + Math.floor(i / STAMP.width))).toBe(
          'shirt',
        );
      }
    });
  });

  it('holds the ball in both gloves when he catches it, and only then', () => {
    for (const [name, map] of FRAMES) {
      const near = around(map, map.hands, 8);
      const gloves = near.filter((pixel) => GLOVE.has(pixel.letter));

      expect(
        near.some((pixel) => BALL.has(pixel.letter)),
        name,
      ).toBe(Boolean(map.holdsBall));

      if (map.holdsBall) {
        expect(
          gloves.some((pixel) => pixel.dx < -2 && pixel.dy < 0),
          name,
        ).toBe(true);
        expect(
          gloves.some((pixel) => pixel.dx > 1 && pixel.dy > 1),
          name,
        ).toBe(true);
        expect(
          around(map, map.hands, 1).every((pixel) => BALL.has(pixel.letter)),
          name,
        ).toBe(true);
      }
    }
  });

  it('dives on a steep diagonal for a high ball, a shallow one at mid height, flat for a low one', () => {
    const rise = (map) => (map.anchor.y - map.hands.y) / (map.hands.x - map.anchor.x);

    for (const grip of ['reach', 'catch', 'punch']) {
      expect(rise(DIVE_FRAMES.high[grip]), grip).toBeGreaterThan(0.6);
      expect(rise(DIVE_FRAMES.high[grip]), grip).toBeLessThan(1);
      expect(rise(DIVE_FRAMES.mid[grip]), grip).toBeGreaterThan(0.3);
      expect(rise(DIVE_FRAMES.mid[grip]), grip).toBeLessThan(0.6);
      expect(rise(DIVE_FRAMES.low[grip]), grip).toBeLessThan(0.1);
    }
  });

  it('has a face we can see in every frame: skin, and the whites of his eyes', () => {
    for (const [name, map] of FRAMES) {
      const letters = map.rows.join('');

      expect(letters, name).toContain('E');
      expect(letters, name).toMatch(/[stuv]/);
    }
  });
});
