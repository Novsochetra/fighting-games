import { DIGITS } from '../../art/shirt-numbers.js';

export const STAMP_CODES = { empty: 0, fill: 1, edge: 2 };

const GAP = 1;
const DIGIT_HEIGHT = DIGITS[0].length;
const WIDEST = Math.max(...Object.values(DIGITS).map((rows) => rows[0].length));

// room for the widest two digits and their outline; a shorter number sits in its middle
export const STAMP = { width: WIDEST * 2 + GAP + 2, height: DIGIT_HEIGHT + 2 };

const AROUND = [-1, 0, 1].flatMap((dy) => [-1, 0, 1].map((dx) => [dx, dy]));

// a shirt carries 1 to 99; anything past it shows its last two digits
const digitsOf = (number) => [...String(Math.abs(Math.trunc(number)) % 100)];

function placeDigits(codes, glyphs) {
  const width = glyphs.reduce((sum, rows) => sum + rows[0].length, 0) + GAP * (glyphs.length - 1);
  let left = 1 + Math.floor((STAMP.width - 2 - width) / 2);

  for (const rows of glyphs) {
    rows.forEach((line, y) => {
      [...line].forEach((mark, x) => {
        if (mark === '#') {
          codes[(y + 1) * STAMP.width + left + x] = STAMP_CODES.fill;
        }
      });
    });
    left += rows[0].length + GAP;
  }
}

const isFill = (codes, x, y) =>
  x >= 0 && y >= 0 && x < STAMP.width && y < STAMP.height
    ? codes[y * STAMP.width + x] === STAMP_CODES.fill
    : false;

function outline(codes) {
  for (let y = 0; y < STAMP.height; y += 1) {
    for (let x = 0; x < STAMP.width; x += 1) {
      const at = y * STAMP.width + x;

      if (
        codes[at] === STAMP_CODES.empty &&
        AROUND.some(([dx, dy]) => isFill(codes, x + dx, y + dy))
      ) {
        codes[at] = STAMP_CODES.edge;
      }
    }
  }
}

// a number as STAMP's grid of codes, row by row: its digits filled and, on the back, a pixel of
// outline round them; the chest's is printed plain, as it sits smaller on a real shirt
export function stampCodes(number, side = 'back') {
  const codes = new Uint8Array(STAMP.width * STAMP.height);

  placeDigits(
    codes,
    digitsOf(number).map((digit) => DIGITS[digit]),
  );

  if (side === 'back') {
    outline(codes);
  }

  return codes;
}
