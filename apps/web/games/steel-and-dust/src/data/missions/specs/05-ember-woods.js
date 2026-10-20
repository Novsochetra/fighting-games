import { bank, mound, ramp, stairs } from '../ground-shapes.js';

export const EMBER_WOODS = {
  name: 'Ember Woods',
  theme: 'emberWoods',
  boss: 'queen',
  reinforcements: ['scorpion', 'sentry', 'jackal'],
  crates: ['spear', 'ration', 'axe', 'sword', 'ration'],
  props: [],
  endWall: 'palisade',
  zones: [
    {
      screens: 2,
      ground: [...ramp(70, 280, 24), ...mound(460, 700, 12, 48)],
      platforms: [{ at: 300, width: 80, rise: 26, kind: 'planks' }],
      waves: [
        ['scorpion', 'scorpion', 'jackal'],
        ['sentry', 'grunt', 'scorpion'],
        ['scorpion', 'sentry', 'hound', 'knife'],
      ],
    },
    {
      screens: 3,
      ground: [
        ...bank(-260, -150, 18),
        ...mound(60, 360, 34, 102),
        ...stairs(470, [
          [60, 14],
          [60, 24],
        ]),
        ...mound(820, 1080, 14, 56),
      ],
      platforms: [
        { at: 170, width: 80, rise: 34, kind: 'planks' },
        { at: 600, width: 80, rise: 40, kind: 'planks' },
        { at: 900, width: 80, rise: 26, kind: 'planks' },
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
      ground: [...mound(70, 330, 28, 84), ...mound(470, 700, 12, 48)],
      platforms: [{ at: 360, width: 80, rise: 36, kind: 'planks' }],
      waves: [
        ['scorpion', 'knife', 'sentry'],
        ['bomber', 'scorpion', 'spitter'],
        ['sentry', 'sentry', 'scorpion', 'shield'],
      ],
    },
    {
      screens: 2,
      ground: [
        ...stairs(-250, [
          [50, 12],
          [50, 22],
        ]),
        ...ramp(80, 290, 24),
        ...mound(470, 700, 14, 56),
      ],
      platforms: [{ at: 320, width: 80, rise: 26, kind: 'planks' }],
      waves: [
        ['scorpion', 'scorpion', 'scorpion', 'jackal'],
        ['sentry', 'shield', 'scorpion', 'bomber'],
      ],
    },
    { boss: 'queen', label: 'Hive Heart' },
  ],
};
