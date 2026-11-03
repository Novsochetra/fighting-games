import { rect } from './raster.js';

// a 3 by 5 pixel face for the words painted on boards and banners, five rows of three bits a letter
const GLYPHS = {
  A: [2, 5, 7, 5, 5],
  B: [6, 5, 6, 5, 6],
  C: [3, 4, 4, 4, 3],
  D: [6, 5, 5, 5, 6],
  E: [7, 4, 6, 4, 7],
  F: [7, 4, 6, 4, 4],
  G: [3, 4, 5, 5, 3],
  H: [5, 5, 7, 5, 5],
  I: [7, 2, 2, 2, 7],
  J: [1, 1, 1, 5, 2],
  K: [5, 5, 6, 5, 5],
  L: [4, 4, 4, 4, 7],
  M: [5, 7, 7, 5, 5],
  N: [6, 5, 5, 5, 5],
  O: [2, 5, 5, 5, 2],
  P: [6, 5, 6, 4, 4],
  Q: [2, 5, 5, 6, 3],
  R: [6, 5, 6, 5, 5],
  S: [3, 4, 2, 1, 6],
  T: [7, 2, 2, 2, 2],
  U: [5, 5, 5, 5, 7],
  V: [5, 5, 5, 5, 2],
  W: [5, 5, 7, 7, 5],
  X: [5, 5, 2, 5, 5],
  Y: [5, 5, 2, 2, 2],
  Z: [7, 1, 2, 4, 7],
  0: [7, 5, 5, 5, 7],
  1: [2, 6, 2, 2, 7],
  2: [6, 1, 2, 4, 7],
  3: [6, 1, 2, 1, 6],
  4: [5, 5, 7, 1, 1],
  5: [7, 4, 6, 1, 6],
  6: [3, 4, 7, 5, 7],
  7: [7, 1, 2, 2, 2],
  8: [7, 5, 7, 5, 7],
  9: [7, 5, 7, 1, 6],
  '-': [0, 0, 7, 0, 0],
  '!': [2, 2, 2, 0, 2],
};

export const LETTER_HEIGHT = 5;

export const wordWidth = (word, scale = 1) => Math.max(0, (word.length * 4 - 1) * scale);

// `scale` paints each pixel of a letter as a square that many pixels wide, for a big board
export function paintWord(raster, word, { x, y, colour, scale = 1 }) {
  [...word.toUpperCase()].forEach((letter, i) => {
    (GLYPHS[letter] ?? [0, 0, 0, 0, 0]).forEach((bits, row) => {
      for (let column = 0; column < 3; column += 1) {
        if (bits & (4 >> column)) {
          const left = x + (i * 4 + column) * scale;

          rect(raster, { x: left, y: y + row * scale, width: scale, height: scale }, colour);
        }
      }
    });
  });
}
