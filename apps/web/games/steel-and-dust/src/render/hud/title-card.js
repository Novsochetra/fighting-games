import { TITLE_CARD_COLORS } from '../../art/title-card.js';
import { VIEW_WIDTH } from '../../config.js';
import { drawCardLetter } from '../text/card-letter.js';
import { drawText, textWidth } from '../text/draw-text.js';
import { letterAt, shineAt, typedLength } from './title-card-timing.js';

const SCALE = 5;
const GLYPH_HEIGHT = 5 * SCALE;
const LINE_GAP = 8;
// a title longer than this breaks at its spaces, a word a line
const LINE_LENGTH = 12;
const MIDDLE_Y = 84;
const SUB_GAP = 10;
const SUB_SCALE = 2;
const DUST_TICKS = 8;

function cardLines(text) {
  const upper = text.toUpperCase();
  return upper.length > LINE_LENGTH ? upper.split(' ') : [upper];
}

function lineLetters(line, y) {
  const left = VIEW_WIDTH / 2 - Math.floor(textWidth(line, SCALE) / 2);
  return [...line]
    .map((char, i) => ({ char, x: left + i * 4 * SCALE, y }))
    .filter((letter) => letter.char !== ' ');
}

// every letter of a title, placed: its lines centered under one another, the letters counted
// across them so they fall in reading order
export function layoutCard(text) {
  const lines = cardLines(text);
  const height = lines.length * (GLYPH_HEIGHT + LINE_GAP) - LINE_GAP;
  const top = Math.round(MIDDLE_Y - height / 2);
  const letters = lines.flatMap((line, i) =>
    lineLetters(line, top + i * (GLYPH_HEIGHT + LINE_GAP)),
  );
  const left = Math.min(...letters.map((letter) => letter.x));
  return { letters, top, left, bottom: top + height, scale: SCALE };
}

// two specks kicked out from a letter's feet as it strikes
function drawStrikeDust(painter, { x, y }, sinceHit) {
  if (sinceHit < 0 || sinceHit >= DUST_TICKS) {
    return;
  }
  const spread = 2 + sinceHit * 2;
  const size = sinceHit < DUST_TICKS / 2 ? 2 : 1;
  const top = y + GLYPH_HEIGHT - Math.floor(sinceHit / 2) - size;
  painter.use(TITLE_CARD_COLORS.dust);
  painter.rect(x - 1 - spread, top, size, size).rect(x + 3 * SCALE + spread, top, size, size);
}

function drawSub(painter, { sub, card, typed }) {
  const left = VIEW_WIDTH / 2 - Math.floor(textWidth(sub, SUB_SCALE) / 2);
  drawText(painter, sub.slice(0, typed), {
    x: left,
    y: card.bottom + SUB_GAP,
    color: TITLE_CARD_COLORS.sub,
    scale: SUB_SCALE,
  });
}

// a mission's title stamped in a letter at a time, as the arcade run-and-guns call a mission
export function drawTitleCard(painter, { banner, age }) {
  const card = layoutCard(banner.text);
  const count = card.letters.length;
  const shine = shineAt(age, count);
  card.letters.forEach((letter, index) => {
    const fall = letterAt(age, index);
    if (fall) {
      drawStrikeDust(painter, letter, fall.sinceHit);
      const { offset, hot } = fall;
      const shineFrom = card.left + card.top;
      drawCardLetter(painter, {
        ...letter,
        y: letter.y + offset,
        scale: SCALE,
        hot,
        shine,
        shineFrom,
      });
    }
  });
  if (banner.sub) {
    drawSub(painter, { sub: banner.sub, card, typed: typedLength(age, count) });
  }
}
