import { GLYPH_HEIGHT, GLYPHS } from '../../art/duel/glyphs.js';
import { WORD_EDGE } from '../../art/duel/palette.js';

const glyphOf = (letter) => GLYPHS[letter.toUpperCase()] ?? GLYPHS[' '];

// each letter's runs of lit pixels, row by row, where `size` art pixels make one of its pixels
function runsOf(text, size) {
  const runs = [];
  let left = 0;

  for (const letter of text) {
    const rows = glyphOf(letter);

    rows.forEach((row, rowIndex) => {
      for (const match of row.matchAll(/1+/g)) {
        const above = rows[rowIndex - 1] ?? '';

        runs.push({
          x: left + match.index * size,
          row: rowIndex,
          length: match[0].length,
          above,
          from: match.index,
        });
      }
    });
    left += (rows[0].length + 1) * size;
  }

  return { runs, width: left - size };
}

export const wordWidth = (text, size) => runsOf(text, size).width;

// the letter's rows step down its ramp, light at the top, as a title painted in 16 bits
const RAMP_ROWS = [0, 1, 1, 2, 2, 3, 4];

function paintRuns(pen, { runs, left, top, size, edge, color }) {
  for (const run of runs) {
    pen.rect(
      [
        left + run.x - edge,
        top + run.row * size - edge,
        run.length * size + edge * 2,
        size + edge * 2,
      ],
      color,
    );
  }
}

function paintLight(pen, { runs, left, top, size, ramp }) {
  for (const run of runs) {
    const y = top + run.row * size;

    pen.rect([left + run.x, y, run.length * size, size], ramp[RAMP_ROWS[run.row]]);

    for (let i = 0; i < run.length; i += 1) {
      if (run.above[run.from + i] !== '1') {
        pen.rect([left + run.x + i * size, y, size, 1], ramp[0]);
      }
    }
  }
}

export function drawPixelWord(pen, { text, x, y, size, ramp, align = 'center', edge = 1 }) {
  const { runs, width } = runsOf(text, size);
  const left = Math.round(align === 'center' ? x - width / 2 : x);
  const top = Math.round(y);
  const drop = Math.max(1, Math.round(size / 2));

  paintRuns(pen, { runs, left: left + drop, top: top + drop, size, edge, color: WORD_EDGE.shadow });
  paintRuns(pen, { runs, left, top, size, edge, color: WORD_EDGE.outline });
  paintLight(pen, { runs, left, top, size, ramp });

  return { left, top, width, height: GLYPH_HEIGHT * size };
}
