// The digits a shirt's number is drawn in, three pixels wide and five tall, a narrow one; the
// number is printed in its kit's colour, outlined a pixel round in its shirt's own shades
export const DIGITS = {
  0: ['###', '#.#', '#.#', '#.#', '###'],
  1: ['.#', '##', '.#', '.#', '.#'],
  2: ['###', '..#', '###', '#..', '###'],
  3: ['###', '..#', '.##', '..#', '###'],
  4: ['#.#', '#.#', '###', '..#', '..#'],
  5: ['###', '#..', '###', '..#', '###'],
  6: ['###', '#..', '###', '#.#', '###'],
  7: ['###', '..#', '..#', '.#.', '.#.'],
  8: ['###', '#.#', '###', '#.#', '###'],
  9: ['###', '#.#', '###', '..#', '###'],
};

const WHITE = '#f4f2ec';
const INK = '#161a2a';
const NAVY = '#1f2c5a';
const BLACK = '#262a3a';

// a number reads on its shirt: white on a deep one, dark on a pale one, or the kit's trim where it
// stands out enough
export const NUMBER_COLOURS = {
  'chrey-school': { home: WHITE, away: '#2f82d2', keeper: INK },
  'neighbor-village': { home: WHITE, away: INK, keeper: WHITE },
  'riverside-school': { home: NAVY, away: '#1fa39c', keeper: WHITE },
  'royal-kids': { home: '#f0c84a', away: '#6b3fb4', keeper: INK },
  'kampong-cham-high': { home: NAVY, away: NAVY, keeper: INK },
  'siem-reap-high': { home: '#2e6b3c', away: '#e8c23a', keeper: WHITE },
  'battambang-high': { home: '#f2cf3c', away: WHITE, keeper: INK },
  'kampot-high': { home: NAVY, away: WHITE, keeper: NAVY },
  'phnom-penh-elite': { home: '#f0c84a', away: BLACK, keeper: WHITE },
  cambodia: { home: WHITE, away: WHITE, keeper: INK },
  japan: { home: WHITE, away: '#1c3c9c', keeper: INK },
  thailand: { home: WHITE, away: '#2852c4', keeper: NAVY },
  korea: { home: WHITE, away: '#d42436', keeper: BLACK },
  iran: { home: '#2a9a4a', away: WHITE, keeper: WHITE },
  brazil: { home: '#2352b4', away: '#f4d02a', keeper: '#f4d02a' },
  nigeria: { home: INK, away: '#156c44', keeper: INK },
  mexico: { home: WHITE, away: '#156c44', keeper: WHITE },
  germany: { home: BLACK, away: WHITE, keeper: BLACK },
};

// by the keeper's spare shirt (KEEPER_SPARES in kits.js), and the plain sides' kits (PLAIN_KITS)
export const SPARE_NUMBER_COLOURS = [WHITE, NAVY, WHITE, '#f2cf3c'];

export const PLAIN_NUMBER_COLOURS = [
  { home: WHITE, away: '#d0262e', keeper: INK },
  { home: WHITE, away: NAVY, keeper: INK },
];

// Sochetra's training shirt, whose gold trim is too close to its red to read
export const TRAINING_NUMBER = WHITE;

// what a number's colour is set against: a shirt that has no colour named takes whichever of these
// reads better on it
export const NUMBER_INKS = { light: WHITE, dark: INK };
