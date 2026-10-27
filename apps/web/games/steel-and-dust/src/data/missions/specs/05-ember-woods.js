import { bank, contour, ledge, mound } from '../ground-shapes.js';

export const EMBER_WOODS = {
  name: 'Ember Woods',
  theme: 'emberWoods',
  boss: 'queen',
  reinforcements: ['scorpion', 'sentry', 'jackal'],
  crates: ['spear', 'ration', 'axe', 'sword', 'ration'],
  endWall: 'palisade',
  zones: [
    {
      screens: 2,
      // a leaf-deep hill, climbed on a long slope and left by a step down to its shoulder
      ground: [
        ...contour(60, [
          [120, 24],
          [80, 24],
          [0, 12],
          [50, 12],
          [40, 0],
        ]),
        ...mound(560, 720, 8, 50),
      ],
      platforms: [{ at: 476, width: 80, rise: 30, kind: 'planks' }],
      waves: [
        ['scorpion', 'scorpion', 'jackal'],
        ['sentry', 'grunt', 'scorpion'],
        ['scorpion', 'sentry', 'hound', 'knife'],
      ],
    },
    {
      screens: 3,
      trees: [842],
      nests: [1060],
      // the ember ridge: up to its crest and down a broken step; then two rises of rock and a
      // deck over the lock for the sentries
      ground: [
        ...mound(-250, -140, 10, 40),
        ...contour(70, [
          [90, 20],
          [50, 34],
          [90, 34],
          [0, 18],
          [60, 18],
          [50, 0],
        ]),
        ...contour(480, [
          [0, 10],
          [60, 10],
          [0, 20],
          [70, 20],
          [80, 0],
        ]),
      ],
      platforms: [
        { at: 215, width: 80, rise: 28, kind: 'planks' },
        { at: 700, width: 80, rise: 30, kind: 'planks' },
        { at: 900, width: 80, rise: 28, kind: 'planks' },
      ],
      waves: [
        ['sentry', 'shield', 'scorpion'],
        ['scorpion', 'scorpion', 'bomber'],
        ['spitter', 'sentry', 'jackal'],
        ['scorpion', 'shield', 'sentry', 'hound'],
      ],
    },
    {
      screens: 2,
      trees: [580],
      nests: [440],
      // a leaf hollow between two low knolls, a deck over it
      ground: [...mound(60, 200, 18, 50), ...mound(270, 400, 12, 40)],
      platforms: [{ at: 190, width: 80, rise: 36, kind: 'planks' }],
      waves: [
        ['scorpion', 'knife', 'sentry'],
        ['bomber', 'scorpion', 'spitter'],
        ['sentry', 'sentry', 'scorpion', 'shield'],
      ],
    },
    {
      screens: 2,
      // a fallen trunk to jump, then a long bank of leaves to fight down from
      ground: [
        ...ledge(-250, -150, 12, 50),
        ...bank(80, 150, 16),
        ...mound(200, 400, 14, 60),
        ...mound(520, 728, 6, 70),
      ],
      platforms: [{ at: 230, width: 80, rise: 30, kind: 'planks' }],
      waves: [
        ['scorpion', 'scorpion', 'scorpion', 'jackal'],
        ['sentry', 'shield', 'scorpion', 'bomber'],
      ],
    },
    { boss: 'queen', label: 'Hive Heart' },
  ],
};
