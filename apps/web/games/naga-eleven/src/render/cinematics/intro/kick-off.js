import { CINE } from '../../../art/cinematics/palette.js';
import { VIEW } from '../../../config.js';
import { lettersOf } from '../../text.js';
import { easeOut, shareOf } from '../shared/ease.js';
import { hashOf } from '../shared/hash.js';
import { LABELS } from '../shared/labels.js';
import { drawSlantRows } from '../shared/panel.js';
import { drawWords, widthOf, wordsOf } from '../shared/words.js';

const BAND = { y: 186, height: 54 };
const MIDDLE = VIEW.width / 2;
const LETTER = { first: 5, step: 2, fall: 7, drop: 44 };
const STREAKS = 14;

function drawBand(context, { half, top, height }) {
  const rect = { x: MIDDLE - half, y: top, width: half * 2, height };

  drawSlantRows(context, rect, CINE.ink);
  drawSlantRows(context, { ...rect, x: rect.x + 1, y: top + 1, height: height - 2 }, CINE.panel[1]);
  drawSlantRows(context, { ...rect, y: top + 1, height: 2 }, CINE.gold[3]);
  drawSlantRows(context, { ...rect, y: top + 3, height: 1 }, CINE.gold[1]);
  drawSlantRows(context, { ...rect, y: top + height - 4, height: 1 }, CINE.gold[1]);
  drawSlantRows(context, { ...rect, y: top + height - 3, height: 2 }, CINE.gold[2]);
}

// each letter drops onto the band in turn
function drawLetters(context, words, { age, y }) {
  const letters = lettersOf(words);
  const widths = letters.map((letter) => widthOf(context, letter, 24));
  let left = MIDDLE - widths.reduce((sum, width) => sum + width, 0) / 2;

  letters.forEach((letter, i) => {
    const fall = shareOf(age, LETTER.first + i * LETTER.step, LETTER.fall);

    if (fall > 0) {
      const lift = Math.round((1 - easeOut(fall)) * LETTER.drop);

      drawWords(context, letter, { x: left, y: y - lift, size: 24, color: CINE.gold[3], drop: 2 });
    }

    left += widths[i];
  });

  return LETTER.first + letters.length * LETTER.step + LETTER.fall;
}

function drawStreaks(context, { age, top, height }) {
  for (let i = 0; i < STREAKS; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const spread = Math.round(hashOf(i, 5) * 34);
    const y = hashOf(i, 3) < 0.5 ? top - 4 - spread : top + height + 3 + spread;
    const length = 24 + Math.round(hashOf(i, 7) * 60);
    const tip = MIDDLE + side * Math.round(age * 16 + hashOf(i, 11) * 90);
    const from = Math.max(0, side > 0 ? tip : tip - length);
    const to = Math.min(VIEW.width, side > 0 ? tip + length : tip);

    if (to > from) {
      context.fillStyle = hashOf(i, 13) < 0.4 ? CINE.white : CINE.gold[3];
      context.fillRect(from, y, to - from, 1);
    }
  }
}

export function drawKickOff(context, state) {
  const { kickoff, length } = state.beats;
  const age = state.tick - kickoff;

  if (age < 0 || state.tick >= length) {
    return;
  }

  const half = Math.round((MIDDLE + 24) * easeOut(age / 8));
  const height = Math.max(2, Math.round(BAND.height * easeOut((length - state.tick) / 10)));
  const top = BAND.y + Math.round((BAND.height - height) / 2);

  drawBand(context, { half, top, height });

  if (age < 30) {
    drawStreaks(context, { age, top, height });
  }

  if (height < BAND.height * 0.7) {
    return;
  }

  const landed = drawLetters(context, wordsOf(LABELS.kickOff, state.lang), { age, y: top + 15 });

  if (age >= landed && age < landed + 3) {
    context.globalAlpha = 0.45;
    drawSlantRows(context, { x: MIDDLE - half, y: top, width: half * 2, height }, CINE.flash);
    context.globalAlpha = 1;
  }
}
