import { describe, expect, it } from 'vitest';
import { STAMP, STAMP_CODES, stampCodes } from '../../../../src/render/actors/number-stamp.js';

const NUMBERS = Array.from({ length: 99 }, (_, i) => i + 1);

const codeAt = (codes, x, y) =>
  x >= 0 && y >= 0 && x < STAMP.width && y < STAMP.height ? codes[y * STAMP.width + x] : null;

function cellsOf(codes, code) {
  const cells = [];

  for (let y = 0; y < STAMP.height; y += 1) {
    for (let x = 0; x < STAMP.width; x += 1) {
      if (codeAt(codes, x, y) === code) {
        cells.push([x, y]);
      }
    }
  }

  return cells;
}

const AROUND = [-1, 0, 1].flatMap((dy) => [-1, 0, 1].map((dx) => [dx, dy]));

describe('a back number', () => {
  it.each(NUMBERS)('%i is outlined all round, the outline inside its box', (number) => {
    const codes = stampCodes(number, 'back');
    const filled = cellsOf(codes, STAMP_CODES.fill);

    expect(filled.length).toBeGreaterThan(5);

    for (const [x, y] of filled) {
      for (const [dx, dy] of AROUND) {
        expect([STAMP_CODES.fill, STAMP_CODES.edge]).toContain(codeAt(codes, x + dx, y + dy));
      }
    }
  });

  it('keeps its outline to the pixels that touch a digit', () => {
    const codes = stampCodes(7, 'back');

    for (const [x, y] of cellsOf(codes, STAMP_CODES.edge)) {
      const touches = AROUND.some(([dx, dy]) => codeAt(codes, x + dx, y + dy) === STAMP_CODES.fill);

      expect(touches).toBe(true);
    }
  });

  it('sits in the middle of its box, one digit or two', () => {
    for (const number of [1, 4, 10, 11, 23]) {
      const columns = cellsOf(stampCodes(number, 'back'), STAMP_CODES.fill).map(([x]) => x);
      const left = Math.min(...columns);
      const right = STAMP.width - 1 - Math.max(...columns);

      expect(Math.abs(left - right)).toBeLessThanOrEqual(1);
    }
  });

  it('leaves a bare column between two digits, so 11 is not a block', () => {
    const codes = stampCodes(11, 'back');
    const columns = new Set(cellsOf(codes, STAMP_CODES.fill).map(([x]) => x));
    const span = [...columns].sort((first, second) => first - second);

    expect(span.at(-1) - span[0] + 1).toBeGreaterThan(columns.size);
  });

  it('shows the last two digits of a number past 99', () => {
    expect(stampCodes(123, 'back')).toEqual(stampCodes(23, 'back'));
  });
});

describe('a chest number', () => {
  it('is printed plain, with the same digits as the back', () => {
    const chest = stampCodes(10, 'chest');
    const back = stampCodes(10, 'back');

    expect(cellsOf(chest, STAMP_CODES.edge)).toEqual([]);
    expect(cellsOf(chest, STAMP_CODES.fill)).toEqual(cellsOf(back, STAMP_CODES.fill));
  });
});
