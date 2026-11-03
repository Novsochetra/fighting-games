import { WORD_RAMPS } from '../../art/duel/palette.js';
import { moveOf } from '../../data/moves.js';
import { textOf } from '../text.js';
import { toCanvas } from './layout.js';
import { chainMoves } from './menu-detail.js';
import { fitLines } from './name-lines.js';
import { drawOutlinedText } from './outlined-text.js';
import { drawPixelWord, wordWidth } from './pixel-word.js';

// a chain's moves, small over its name: the skill it ran from ("APSARA CURL >" over NAGA SHOT),
// or for a named chain both its moves over its own name
function chainLine(option, lang) {
  const [from, to] = chainMoves(option);

  if (!from) {
    return null;
  }

  const named = to !== option.move;
  const names = (named ? [from, to] : [from]).map((id) => textOf(moveOf(id)?.name, lang));

  return `${names.join(' > ')}${named ? '' : ' >'}`;
}

// the Khmer under the stamped name: a chain reads its moves into the name as the English does
function khmerLine(option, tag) {
  const name = textOf(option.label, 'km');
  const chain = tag === 'chain' ? chainLine(option, 'km') : null;

  if (!chain) {
    return name;
  }

  return chain.endsWith('>') ? `${chain} ${name}` : `${name} (${chain})`;
}

function lead(pen, { line, x, top, room, ramp }) {
  const size = Math.max(1, Math.min(2, Math.floor(room / wordWidth(line, 1))));

  drawPixelWord(pen, {
    text: line.toUpperCase(),
    x,
    y: top,
    size,
    ramp: [ramp[1], ramp[2], ramp[2], ramp[3], ramp[3]],
  });

  return size * 7 + 4;
}

// the move's name stamped in its look's letters, a chain's first move over it, the Khmer under
export function drawCutinName(pen, { option, tag, lang, left, room, art, band }) {
  const ramp = WORD_RAMPS[art.word];
  const first = tag === 'chain' ? chainLine(option, 'en') : null;
  const { lines, size } = fitLines(
    textOf(option.label, 'en'),
    room,
    lang === 'km' || first ? 3 : 4,
  );
  const lineHeight = size * 7 + 3;
  const middle = left + room / 2;
  const height = lines.length * lineHeight + (first ? 18 : 0);
  let top = band.top + (lang === 'km' ? 8 : Math.round(band.height / 2 - height / 2));

  if (first) {
    top += lead(pen, { line: first, x: middle, top, room, ramp });
  }

  lines.forEach((line, i) => {
    drawPixelWord(pen, { text: line, x: middle, y: top + i * lineHeight, size, ramp });
  });

  if (lang === 'km') {
    drawOutlinedText(pen.context, khmerLine(option, tag), {
      x: pen.origin.x + toCanvas(middle),
      y: pen.origin.y + toCanvas(top + lines.length * lineHeight + 4),
      size: 24,
      color: ramp[1],
    });
  }
}
