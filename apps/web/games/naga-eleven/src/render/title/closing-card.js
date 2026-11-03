import { CHAPTER_TITLE } from '../../art/title/chapter-title.js';
import { VIEW } from '../../config.js';
import { drawBackdrop } from '../backdrops/index.js';
import { ART_SCALE } from '../backdrops/raster.js';
import { drawText, isKhmer, textOf, wrapText } from '../text.js';
import { drawCardBand } from './card-band.js';

// The card the story closes on: the trophy under the lights, and across the stage below it the
// end and the story's moral, written on a chapter card's band made taller for two lines.
export const CLOSING_BAND = { y: 136, height: 64 };

// the end comes up a beat after the picture, the moral a beat after it
export const CLOSING_BEATS = { title: 30, moral: 75 };

const MORAL_WIDTH = 600;
const RULE_WIDTH = 140;

const styleOf = (text) =>
  isKhmer(text) ? { size: 20, lineHeight: 28 } : { size: 16, lineHeight: 21 };

function drawMoral(context, { moral, lang, top }) {
  const texts = moral.map((sentence) => textOf(sentence, lang));
  const style = styleOf(texts[0]);
  const lines = texts.flatMap((text) =>
    wrapText(context, text, { maxWidth: MORAL_WIDTH, size: style.size }),
  );

  lines.forEach((line, i) =>
    drawText(context, line, {
      x: VIEW.width / 2,
      y: top + i * style.lineHeight,
      color: CHAPTER_TITLE.title,
      shadow: CHAPTER_TITLE.shadow,
      align: 'center',
      size: style.size,
    }),
  );
}

export function drawClosingCard(context, { title, moral, lang, tick = 0, age = 0 }) {
  const top = CLOSING_BAND.y * ART_SCALE;
  const middle = VIEW.width / 2;

  context.save();
  context.imageSmoothingEnabled = false;
  drawBackdrop(context, 'trophy-stage', { tick });
  drawCardBand(context, { band: CLOSING_BAND, width: VIEW.width });

  if (age >= CLOSING_BEATS.title) {
    drawText(context, textOf(title, lang), {
      x: middle,
      y: top + 12,
      color: CHAPTER_TITLE.number,
      shadow: CHAPTER_TITLE.shadow,
      align: 'center',
      size: 24,
    });
    context.fillStyle = CHAPTER_TITLE.rule;
    context.fillRect(middle - RULE_WIDTH / 2, top + 46, RULE_WIDTH, 2);
  }

  if (age >= CLOSING_BEATS.moral) {
    drawMoral(context, { moral, lang, top: top + 60 });
  }

  context.restore();
}
