import { TITLE_CARD_COLORS } from '../../art/title-card.js';
import { GLYPHS } from './glyphs.js';

// the depth the letters are pressed in, in view pixels, showing under each stroke
const DEPTH = 2;
const SHINE_WIDTH = 12;

function glyphPixels(char) {
  const glyph = GLYPHS[char] || GLYPHS['?'];
  const pixels = [];
  for (let row = 0; row < 5; row++) {
    for (let column = 0; column < 3; column++) {
      if (glyph[row] & (4 >> column)) {
        pixels.push({ column, row });
      }
    }
  }
  return pixels;
}

function faceColor(letter, { x, y, row }) {
  if (letter.hot) {
    return TITLE_CARD_COLORS.hot;
  }
  const along = x + y - letter.shineFrom;
  if (letter.shine !== null && along <= letter.shine && along > letter.shine - SHINE_WIDTH) {
    return TITLE_CARD_COLORS.shine;
  }
  return TITLE_CARD_COLORS.face[row];
}

// one letter of a title card, a block a glyph pixel: a dark outline that runs deeper under it, its
// pressed depth, then its face; `shine` is how far a band of light has run from `shineFrom`
export function drawCardLetter(painter, letter) {
  const { context } = painter;
  const { char, x, y, scale } = letter;
  const blocks = glyphPixels(char).map(({ column, row }) => ({
    x: x + column * scale,
    y: y + row * scale,
    row,
    size: scale,
  }));
  context.fillStyle = TITLE_CARD_COLORS.outline;
  for (const block of blocks) {
    context.fillRect(block.x - 1, block.y - 1, block.size + 2, block.size + 2 + DEPTH);
  }
  context.fillStyle = TITLE_CARD_COLORS.depth;
  for (const block of blocks) {
    context.fillRect(block.x, block.y + DEPTH, block.size, block.size);
  }
  for (const block of blocks) {
    context.fillStyle = faceColor(letter, block);
    context.fillRect(block.x, block.y, block.size, block.size);
  }
}
