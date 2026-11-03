export const LETTERS_PER_TICK = 1.5;

// ticks the typing rests after a mark that ends a phrase, so a line reads at the pace it is said
export const PAUSES = {
  ',': 6,
  ';': 6,
  ':': 6,
  '—': 8,
  '.': 12,
  '!': 12,
  '?': 12,
  '…': 14,
  '។': 12,
  '៕': 16,
};

const GRAPHEMES =
  typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter('km', { granularity: 'grapheme' })
    : null;

// Khmer builds one letter from a consonant and the marks stacked on it; typed a code point at a
// time, a vowel would show for a tick on its own, round a dotted circle
export function lettersOf(text) {
  if (!GRAPHEMES) {
    return [...text];
  }

  return [...GRAPHEMES.segment(text)].map((part) => part.segment);
}

export const createTyping = (text) => ({ letters: lettersOf(text), shown: 0, wait: 0 });

export const isTyped = (typing) => typing.shown >= typing.letters.length;

export const shownText = (typing) => typing.letters.slice(0, Math.floor(typing.shown)).join('');

export function finishTyping(typing) {
  typing.shown = typing.letters.length;
  typing.wait = 0;
}

const restAfter = (letters, i) => (/\s/.test(letters[i + 1] ?? '') ? (PAUSES[letters[i]] ?? 0) : 0);

export function typeTick(typing) {
  if (typing.wait > 0) {
    typing.wait -= 1;

    return;
  }

  const from = Math.floor(typing.shown);
  const to = Math.min(typing.letters.length, typing.shown + LETTERS_PER_TICK);

  typing.shown = to;

  for (let i = from; i < Math.floor(to); i += 1) {
    const rest = restAfter(typing.letters, i);

    if (rest > 0) {
      typing.shown = i + 1;
      typing.wait = rest;

      return;
    }
  }
}
