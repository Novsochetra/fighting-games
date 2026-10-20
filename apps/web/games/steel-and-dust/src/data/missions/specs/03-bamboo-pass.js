import { bank, mound, ramp, stairs } from '../ground-shapes.js';

export const BAMBOO_PASS = {
  name: 'Bamboo Pass',
  theme: 'bambooPass',
  boss: 'ironhorn',
  reinforcements: ['hound', 'grunt', 'bomber'],
  crates: ['axe', 'ration', 'sword', 'spear', 'ration'],
  props: [],
  endWall: 'palisade',
  zones: [
    {
      screens: 2,
      ground: [
        ...stairs(70, [
          [70, 10],
          [80, 20],
          [70, 10],
        ]),
        ...mound(470, 700, 12, 48),
      ],
      platforms: [{ at: 330, width: 80, rise: 30, kind: 'planks' }],
      waves: [
        ['hound', 'grunt', 'hound'],
        ['bomber', 'grunt', 'knife'],
        ['hound', 'bomber', 'scrapper', 'grunt'],
      ],
    },
    {
      screens: 2,
      ground: [
        ...ramp(-260, -150, 20),
        ...stairs(80, [
          [60, 14],
          [60, 24],
          [60, 14],
        ]),
        ...mound(460, 700, 14, 56),
      ],
      waves: [
        ['jackal', 'hound', 'sling'],
        ['bomber', 'bomber', 'grunt'],
        ['hound', 'hound', 'knife', 'sling'],
      ],
    },
    {
      screens: 3,
      ground: [
        ...bank(60, 150, 18),
        ...mound(170, 430, 30, 90),
        ...stairs(470, [
          [60, 12],
          [60, 22],
        ]),
        ...mound(820, 1080, 12, 48),
      ],
      platforms: [
        { at: 260, width: 80, rise: 36, kind: 'planks' },
        { at: 900, width: 80, rise: 32, kind: 'planks' },
      ],
      waves: [
        ['bomber', 'scrapper', 'jackal'],
        ['hound', 'knife', 'hound'],
        ['sling', 'bomber', 'grunt'],
        ['hound', 'jackal', 'bomber', 'scrapper'],
      ],
    },
    { boss: 'ironhorn', label: 'Shrine Gate' },
  ],
};
