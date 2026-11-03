import { CHAPTER_TITLE } from '../../art/title/chapter-title.js';
import { VIEW } from '../../config.js';
import { drawText, numberIn, textOf } from '../text.js';
import { drawChapterCard } from './index.js';

// the band the card keeps dark for its words, in canvas pixels
const BAND = { top: 272, height: 100 };
// Khmer writes the number in its own digits, right after the word, as the chapters list does
const LABEL = {
  en: (number) => `CHAPTER ${number}`,
  km: (number) => `ជំពូកទី${numberIn(number, 'km')}`,
};
const RULE_WIDTH = 120;

// the words come up a beat after the picture
const WORDS_AFTER = 20;

export function drawChapterTitle(context, { number, title, lang, tick, age }) {
  const middle = VIEW.width / 2;
  const shown = age >= WORDS_AFTER;

  drawChapterCard(context, { number, tick });

  if (!shown) {
    return;
  }

  const label = (LABEL[lang] ?? LABEL.en)(number);

  drawText(context, label, {
    x: middle,
    y: BAND.top + 14,
    color: CHAPTER_TITLE.number,
    shadow: CHAPTER_TITLE.shadow,
    align: 'center',
    size: 16,
  });
  context.fillStyle = CHAPTER_TITLE.rule;
  context.fillRect(middle - RULE_WIDTH / 2, BAND.top + 40, RULE_WIDTH, 2);
  drawText(context, textOf(title, lang), {
    x: middle,
    y: BAND.top + 52,
    color: CHAPTER_TITLE.title,
    shadow: CHAPTER_TITLE.shadow,
    align: 'center',
    size: 24,
  });
}
