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
  ...Object.entries(DIVE_FRAMES.takeoff).map(([height, map]) => [`takeoff ${height}`, map]),
  ...Object.entries(DIVE_FRAMES.hop).map(([height, map]) => [`hop ${height}`, map]),
  ...['high', 'mid', 'low'].flatMap((height) =>
    Object.entries(DIVE_FRAMES[height]).map(([grip, map]) => [`${height} ${grip}`, map]),
  ),
  ...Object.entries(DIVE_FRAMES.land).map(([hands, map]) => [`land ${hands}`, map]),
];

const BALL = new Set(['R', 'S', 'T', 'U', 'P', 'Q']);
const GLOVE = new Set(['G', 'H', 'I', 'J']);

const partOf = (map, x, y) => DIVE_KIT_LETTERS[map.rows[y]?.[x]]?.[0];

const middleOf = (points) => ({
  x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
  y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
});

// how far his head leans over from his hips toward the ball, in degrees off upright
function leanOf(map) {
  const of = (part) =>
    middleOf(
      map.rows.flatMap((row, y) =>
        [...row].flatMap((letter, x) => (DIVE_KIT_LETTERS[letter]?.[0] === part ? [{ x, y }] : [])),
      ),
    );
  const hair = of('hair');
  const hips = of('shorts');

  return (Math.atan2(hair.x - hips.x, hips.y - hair.y) * 180) / Math.PI;
}

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

  it('leans further to the ball frame by frame: set upright, loaded, leaving the grass, stretched', () => {
    expect(Math.abs(leanOf(DIVE_FRAMES.set))).toBeLessThan(5);

    for (const height of ['high', 'mid', 'low']) {
      const leans = [
        DIVE_FRAMES.push[height],
        DIVE_FRAMES.takeoff[height],
        DIVE_FRAMES[height].reach,
      ].map(leanOf);

      expect(leans[0], height).toBeGreaterThan(10);
      expect(leans[1], height).toBeGreaterThan(leans[0] + 10);
      expect(leans[2], height).toBeGreaterThan(leans[1] + 5);
      expect(leanOf(DIVE_FRAMES.hop[height]), height).toBeGreaterThan(leans[0] + 5);
      expect(leanOf(DIVE_FRAMES.hop[height]), height).toBeLessThan(leans[2]);
    }
  });

  it.each(Object.entries(DIVE_FRAMES.push))(
    'shows the whole "1" and its ring on his chest as he loads for a %s ball, in its middle',
    (height, map) => {
      const codes = stampCodes(1, 'back');
      const left = map.number.x - Math.floor(STAMP.width / 2);
      const top = map.number.y - Math.floor(STAMP.height / 2);
      const row = map.rows[map.number.y];
      let from = map.number.x;
      let to = map.number.x;

      codes.forEach((code, i) => {
        if (code !== STAMP_CODES.empty) {
          expect(partOf(map, left + (i % STAMP.width), top + Math.floor(i / STAMP.width))).toBe(
            'shirt',
          );
        }
      });

      while (partOf(map, from - 1, map.number.y) === 'shirt') {
        from -= 1;
      }

      while (partOf(map, to + 1, map.number.y) === 'shirt') {
        to += 1;
      }

      expect(row[map.number.x]).toMatch(/[abcd]/);
      expect(Math.abs(map.number.x - (from + to) / 2)).toBeLessThanOrEqual(3);
    },
  );

  it('has a face we can see in every frame: skin, and the whites of his eyes', () => {
    for (const [name, map] of FRAMES) {
      const letters = map.rows.join('');

      expect(letters, name).toContain('E');
      expect(letters, name).toMatch(/[stuv]/);
    }
  });
});
