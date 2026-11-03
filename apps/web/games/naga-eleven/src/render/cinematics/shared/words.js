import { CINE } from '../../../art/cinematics/palette.js';
import { drawText, measureText, textOf } from '../../text.js';

const RING = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
];

// the big words of a broadcast are set bold; Silkscreen keeps whole pixels at 8, 16 and 24 px
const weightOf = (size) => (size >= 16 ? 700 : 400);

export const wordsOf = (value, lang) => textOf(value, lang).toUpperCase();

export const widthOf = (context, words, size = 8) =>
  Math.ceil(measureText(context, words, { size, weight: weightOf(size) }));

// a line ringed in ink so it reads over grass, crowd or a busy plate; `drop` sets a shadow under
// the ring, for the larger words
export function drawWords(context, words, options) {
  const { x, y, size = 8, color = CINE.text, outline = CINE.ink, drop = 0 } = options;
  const style = { size, weight: weightOf(size), align: options.align, baseline: options.baseline };

  if (drop > 0) {
    drawText(context, words, { ...style, x, y: y + drop + 1, color: outline });
  }

  if (outline) {
    for (const [dx, dy] of RING) {
      drawText(context, words, { ...style, x: x + dx, y: y + dy, color: outline });
    }
  }

  drawText(context, words, { ...style, x, y, color });
}
