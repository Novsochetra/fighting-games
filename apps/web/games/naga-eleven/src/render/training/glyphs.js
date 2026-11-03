import { GRADE_COLORS } from '../../art/training/cards.js';
import { paint } from './pixels.js';

// the grade letters drawn as pixel art of their own, so a stamp stays crisp at any size
const GLYPHS = {
  S: ['011110', '110011', '110000', '011110', '000011', '110011', '011110'],
  A: ['001100', '011110', '110011', '110011', '111111', '110011', '110011'],
  B: ['111110', '110011', '110011', '111110', '110011', '110011', '111110'],
  C: ['011110', '110011', '110000', '110000', '110000', '110011', '011110'],
};

export const GLYPH_SIZE = { width: 6, height: 7 };

function fill(context, color, { rows, x, y, scale }) {
  rows.forEach((row, j) => {
    [...row].forEach((bit, i) => {
      if (bit === '1') {
        paint(context, color, [x + i * scale, y + j * scale, scale, scale]);
      }
    });
  });
}

// the ink, a shade under it and a light along each stroke's top
export function drawGlyph(context, { letter, x, y, scale }) {
  const rows = GLYPHS[letter] ?? GLYPHS.C;
  const colors = GRADE_COLORS[letter] ?? GRADE_COLORS.C;
  const edge = Math.max(1, Math.round(scale / 3));

  fill(context, colors.ink, { rows, x: x - edge, y, scale });
  fill(context, colors.ink, { rows, x: x + edge, y, scale });
  fill(context, colors.ink, { rows, x, y: y - edge, scale });
  fill(context, colors.ink, { rows, x, y: y + edge * 2, scale });
  fill(context, colors.shade, { rows, x, y: y + edge, scale });
  fill(context, colors.face, { rows, x, y, scale });

  rows.forEach((row, j) => {
    [...row].forEach((bit, i) => {
      const above = j === 0 || rows[j - 1][i] !== '1';

      if (bit === '1' && above) {
        paint(context, colors.light, [x + i * scale, y + j * scale, scale, edge]);
      }
    });
  });
}
