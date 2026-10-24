export const AVATAR_PALETTES = 6;

// Whole amounts read cleaner without cents: $50, but $4.99.
export function formatMoney(amount, { currency, locale }) {
  const digits = Number.isInteger(amount) ? 0 : 2;
  const options = { minimumFractionDigits: digits, maximumFractionDigits: digits };
  return new Intl.NumberFormat(locale, { style: 'currency', currency, ...options }).format(amount);
}

export const formatCount = (count, locale) => new Intl.NumberFormat(locale).format(count);

// Read as a calendar day in UTC, so the day never shifts with the visitor's time zone.
export function formatDay(isoDay, locale) {
  if (!isoDay) {
    return '';
  }
  const [year, month, day] = isoDay.split('-').map(Number);
  const options = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
  return new Intl.DateTimeFormat(locale, options).format(Date.UTC(year, month - 1, day));
}

// A letter can be several code points (an accent, or a Khmer vowel sign on its consonant), so the
// first letter is the first grapheme where the browser can split them.
function firstLetter(word) {
  if (typeof Intl.Segmenter !== 'function') {
    return Array.from(word)[0];
  }
  return new Intl.Segmenter().segment(word)[Symbol.iterator]().next().value.segment;
}

export function initialsOf(name) {
  const words = name.split(/\s+/).filter(Boolean).slice(0, 2);
  return words.map(firstLetter).join('').toLocaleUpperCase();
}

// The same name always gets the same color; anonymous supporters stay gray.
export function paletteOf({ name, isAnonymous }) {
  if (isAnonymous) {
    return 0;
  }
  let hash = 0;
  for (const character of name) {
    hash = (hash * 31 + character.codePointAt(0)) % 9973;
  }
  return (hash % AVATAR_PALETTES) + 1;
}
