import { drawOutlinedText } from '../../../../../../src/render/duel/outlined-text.js';
import { drawPixelWord, wordWidth } from '../../../../../../src/render/duel/pixel-word.js';
import { polygon } from '../../../../../../src/render/duel/shapes.js';
import { easeIn, easeOut, phaseOf } from '../../tracks/ease.js';

// the lab's 768 by 432 is the duel's grid of 256 by 144 at three of its pixels to one
const UNIT = 3;

const GRID = { width: 256, height: 144 };

const fitSize = (lines, most, room = 236) =>
  Math.min(most, ...lines.map((line) => Math.floor(room / (wordWidth(line, 1) + 1))));

function banner(pen, { ramp, top, height, reach }) {
  const slant = Math.round(height * 0.3);
  const [left, right] = [0, Math.max(0, reach)];

  polygon(
    pen,
    [
      [left, top + slant],
      [right, top - 2],
      [right, top + height - slant],
      [left, top + height + 2],
    ],
    ramp[4],
  );
  pen.rect([left, top + height - 3, right - left, 1], ramp[2]);
}

function exitOf(left) {
  const out = phaseOf(6 - left, 0, 6);

  return { shift: Math.round(easeIn(out) * GRID.width * 0.8), shown: out < 1 };
}

function sizeOf(lines, { most, ticks }) {
  const settled = fitSize(lines, most);

  return ticks < 2 ? Math.min(settled + 1, fitSize(lines, most + 1, 250)) : settled;
}

// `under` is room on the band below the word, for the Khmer line
export function drawSlamWord(pen, { word, ticks, left, top, most, under = 0 }) {
  const size = sizeOf(word.lines, { most, ticks });
  const lineHeight = size * 7 + 4;
  const height = lineHeight * word.lines.length;
  const middle = Math.round(top - height / 2) - Math.max(0, 4 - ticks) * 4;
  const tremble = ticks < 12 ? ((ticks >> 1) % 2) * 2 - 1 : 0;
  const exit = exitOf(left);

  if (!exit.shown) {
    return null;
  }

  banner(pen, {
    ramp: word.ramp,
    top: middle - 4,
    height: height + 4 + under,
    reach: GRID.width * easeOut(phaseOf(ticks, 0, 7)) - exit.shift,
  });
  word.lines.forEach((line, i) => {
    drawPixelWord(pen, {
      text: line,
      x: GRID.width / 2 + tremble + exit.shift,
      y: middle + i * lineHeight,
      size,
      ramp: word.ramp,
    });
  });

  return { bottom: middle + height, shift: exit.shift };
}

export function drawUnderLine(pen, { text, top, shift, color, size = 24 }) {
  drawOutlinedText(pen.context, text, {
    x: pen.origin.x + (GRID.width / 2 + shift) * UNIT,
    y: pen.origin.y + top * UNIT,
    size,
    color,
  });
}

export const WORD_UNIT = UNIT;
