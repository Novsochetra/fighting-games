// the squads grow up with the hero, as Dara and Rithy do (friends.js)
export const AGE_FACES = {
  child: {
    base: { lift: 4, build: 'child', ears: 26 },
    heads: ['child'],
    neck: 5,
    eyes: ['round', 'soft', 'steady'],
    eyeY: 26,
    brows: { y: 23, gap: 3, width: 7 },
    browLooks: ['thick', 'thin'],
    noses: [{ name: 'button', y: 33 }],
    mouthY: 37,
  },
  teen: {
    base: { lift: 2, build: 'teen' },
    heads: ['teen'],
    neck: 5,
    eyes: ['steady', 'soft', 'sharp', 'round'],
    eyeY: 25,
    brows: { y: 22, gap: 3, width: 8 },
    browLooks: ['thick', 'thin', 'heavy'],
    noses: [
      { name: 'button', y: 33 },
      { name: 'small', y: 32 },
    ],
    mouthY: 38,
  },
  young: {
    base: { build: 'broad' },
    heads: ['young', 'adult', 'square'],
    neck: 6,
    eyes: ['steady', 'soft', 'sharp', 'intense', 'steely'],
    eyeY: 26,
    brows: { y: 22, gap: 3, width: 8 },
    browLooks: ['thick', 'heavy'],
    noses: [
      { name: 'small', y: 32 },
      { name: 'straight', y: 31 },
      { name: 'broad', y: 31 },
    ],
    mouthY: 38,
  },
  adult: {
    base: { lift: -1, build: 'big' },
    heads: ['adult', 'square', 'long', 'young'],
    neck: 7,
    eyes: ['steady', 'steely', 'sharp', 'intense'],
    eyeY: 26,
    brows: { y: 22, gap: 3, width: 9 },
    browLooks: ['heavy', 'thick'],
    noses: [
      { name: 'straight', y: 31 },
      { name: 'strong', y: 31 },
      { name: 'broad', y: 31 },
      { name: 'wide', y: 31 },
    ],
    mouthY: 39,
  },
};

// were every man to clench his teeth in a duel, a side's faces would all look alike
export const MOUTH_MOODS = [
  {},
  { neutral: 'smile' },
  { neutral: 'firm', determined: 'firm' },
  { determined: 'tight' },
  { neutral: 'tight', determined: 'stern' },
];
