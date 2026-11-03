import { SKILL_WORDS } from '../../data/skill-words.js';
import { drawText, isKhmer, measureText, numberIn, textOf } from '../text.js';
import { toCanvas, UNIT } from './layout.js';

const PLATE = { height: 6, pad: 1, gap: 2 };

// in canvas pixels under a plate's top: a mark over a Khmer letter rises 4 over where the word is
// set, and set higher it ran into the plate's lit top edge; a Khmer plate stands an art pixel
// higher than a plain one, so the pixel face drops by as much in it to stay in the middle
const TEXT_TOP = { plain: 5, khmer: 9, plainInKhmer: 8 };

const textTop = (piece, khmerPlate) => {
  if (isKhmer(piece)) {
    return TEXT_TOP.khmer;
  }

  return khmerPlate ? TEXT_TOP.plainInKhmer : TEXT_TOP.plain;
};

// a tag's words in pieces, each set in its own face: a partner with no Khmer name keeps the pixel
// face beside the Khmer word, as his name does on the rest of the match screen
function piecesOf(tag, { lang, short = false }) {
  if (tag.word === 'bonus') {
    return [`+${numberIn(tag.value, lang)}`];
  }

  const word = textOf(SKILL_WORDS[tag.word], lang);
  const partner = textOf(tag.partner, lang).toUpperCase();

  if (!partner) {
    return [word];
  }

  return short ? [`+ ${partner}`] : [`${word} + `, partner];
}

const widthOf = (context, pieces) =>
  pieces.reduce((sum, piece) => sum + measureText(context, piece, { size: 8 }), 0);

const plateWidth = (context, pieces) => Math.ceil(widthOf(context, pieces) / UNIT) + PLATE.pad * 2;

const tagsWidth = (context, words) =>
  words.reduce((sum, pieces) => sum + plateWidth(context, pieces) + PLATE.gap, 0);

// the words of a row's tags, `room` art pixels from its name's start to the price: a duo's names
// the partner beside DUO, or alone where the name would not fit by both even at its smaller size,
// as a long Khmer name by a long partner's does
export function tagWords(context, { tags, lang, name, room }) {
  const long = tags.map((tag) => piecesOf(tag, { lang }));
  const nameWidth = measureText(context, name, { size: 8 });

  if (nameWidth <= toCanvas(room - tagsWidth(context, long))) {
    return long;
  }

  return tags.map((tag) => piecesOf(tag, { lang, short: true }));
}

// a tag: a small plate in its colours, its words in the small face, ending at `right`; with a
// Khmer word, set larger with its marks above and below, a taller plate. It has no ink frame: two
// side by side ran into one black box across the lit row's band
export function drawTag(pen, { pieces, art, right, y }) {
  const khmer = pieces.some(isKhmer);
  const width = plateWidth(pen.context, pieces);
  const height = khmer ? PLATE.height + 2 : PLATE.height;
  const top = khmer ? y - 1 : y;
  const left = right - width;
  let x = pen.origin.x + toCanvas(left + width / 2) - widthOf(pen.context, pieces) / 2;

  pen.rect([left, top, width, height], art.back);
  pen.rect([left, top, width, 1], art.edge);

  for (const piece of pieces) {
    drawText(pen.context, piece, {
      x,
      y: pen.origin.y + toCanvas(top) + textTop(piece, khmer),
      color: art.text,
      size: 8,
    });
    x += measureText(pen.context, piece, { size: 8 });
  }

  return left - PLATE.gap;
}
