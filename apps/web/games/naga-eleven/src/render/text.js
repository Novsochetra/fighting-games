// Silkscreen stays crisp at whole multiples of 8px. Khmer has no pixel face here, so a Khmer line
// is set in the Khmer face the phone or computer already has
const PIXEL_FACE = 'Silkscreen, ui-monospace, monospace';
const KHMER_FACE = "'Khmer Sangam MN', 'Noto Sans Khmer', 'Khmer UI', 'Khmer OS', sans-serif";
const KHMER = /[ក-៿᧠-᧿]/;

export const isKhmer = (text) => KHMER.test(text);

// the pieces a word moves in, one letter at a time: a Khmer word joins its letters and marks,
// and a mark drawn alone shows as a dotted circle, so Khmer moves whole
export const lettersOf = (text) => (isKhmer(text) ? [text] : [...text]);

// a game text is a plain string or { en, km }; a missing Khmer line falls back to English
export function textOf(value, lang = 'en') {
  if (typeof value === 'string') {
    return value;
  }

  return value?.[lang] ?? value?.en ?? '';
}

const KHMER_DIGITS = '០១២៣៤៥៦៧៨៩';

export const numberIn = (value, lang) =>
  lang === 'km' ? String(value).replace(/\d/g, (digit) => KHMER_DIGITS[digit]) : String(value);

// Khmer stacks vowels over its letters and consonants under them, and under 12 px those marks
// run together, so a small Khmer word is set at 12 px wherever the layout asks for less
export const KHMER_MIN_SIZE = 12;

export const sizeFor = (text, size = 8) => (isKhmer(text) ? Math.max(size, KHMER_MIN_SIZE) : size);

// the rows a small Khmer line takes over a pixel-font one: it is set larger, with marks under it
const KHMER_ROOM = 6;

export const khmerRoom = (text) => (isKhmer(text) ? KHMER_ROOM : 0);

export const fontFor = (text, { size = 8, weight = 400 } = {}) =>
  `${weight} ${sizeFor(text, size)}px ${isKhmer(text) ? KHMER_FACE : PIXEL_FACE}`;

export function measureText(context, text, style = {}) {
  context.font = fontFor(text, style);

  return context.measureText(text).width;
}

export function drawText(
  context,
  text,
  { x, y, color, shadow, align = 'left', baseline = 'top', ...style },
) {
  const left = Math.round(x);
  const top = Math.round(y);

  context.font = fontFor(text, style);
  context.textAlign = align;
  context.textBaseline = baseline;

  if (shadow) {
    context.fillStyle = shadow;
    context.fillText(text, left + 1, top + 1);
  }

  context.fillStyle = color;
  context.fillText(text, left, top);
}

// Khmer writes words with no space between them, so a long Khmer line breaks between word
// segments the browser finds, and English between words
function wordsOf(text) {
  if (!isKhmer(text) || typeof Intl.Segmenter !== 'function') {
    return text.split(/(\s+)/).filter(Boolean);
  }

  return [...new Intl.Segmenter('km', { granularity: 'word' }).segment(text)].map(
    (part) => part.segment,
  );
}

export function wrapText(context, text, { maxWidth, ...style }) {
  const lines = [];
  let line = '';

  for (const word of wordsOf(text)) {
    const next = line + word;

    if (line && measureText(context, next.trimEnd(), style) > maxWidth) {
      lines.push(line.trimEnd());
      line = word.trimStart();
    } else {
      line = next;
    }
  }

  return line.trim() ? [...lines, line.trimEnd()] : lines;
}
