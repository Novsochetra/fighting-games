import { contour, ledge, mound } from '../ground-shapes.js';

export const OLD_GROVE = {
  name: 'Old Grove',
  theme: 'oldGrove',
  boss: 'colossus',
  reinforcements: ['scrapper', 'jackal', 'sling'],
  crates: ['ration', 'spear', 'sword', 'ration', 'axe'],
  endWall: 'palisade',
  zones: [
    {
      // a root crown: a slope up to its top, a sheer step down onto its shoulder and off it
      screens: 2,
      nests: [690],
      ground: [
        ...contour(60, [
          [90, 18],
          [40, 30],
          [80, 30],
          [0, 18],
          [60, 18],
          [70, 0],
        ]),
      ],
      platforms: [{ at: 520, width: 80, rise: 30, kind: 'planks' }],
      waves: [
        ['scrapper', 'grunt', 'scrapper'],
        ['jackal', 'grunt'],
        ['scrapper', 'jackal', 'grunt', 'knife'],
      ],
    },
    {
      // a hollow between two root shoulders; slingers throw from the deck over it
      screens: 2,
      trees: [607],
      ground: [
        ...mound(-250, -150, 12, 30),
        ...contour(60, [
          [0, 20],
          [90, 20],
          [50, 0],
        ]),
        ...mound(290, 430, 14, 50),
      ],
      platforms: [{ at: 205, width: 80, rise: 36, kind: 'planks' }],
      waves: [
        ['sling', 'grunt', 'grunt'],
        ['jackal', 'jackal', 'scrapper'],
        ['sling', 'scrapper', 'knife', 'jackal'],
      ],
    },
    {
      screens: 3,
      // the great root: up its flank to the crown and down its broken steps, a fallen trunk to
      // jump, and the slingers' deck past it
      ground: [
        ...contour(60, [
          [90, 20],
          [50, 36],
          [70, 36],
          [0, 24],
          [50, 24],
          [0, 12],
          [50, 12],
          [50, 0],
        ]),
        ...ledge(500, 700, 18, 80),
        ...mound(880, 1080, 10, 60),
      ],
      platforms: [
        { at: 720, width: 80, rise: 30, kind: 'planks' },
        { at: 940, width: 80, rise: 34, kind: 'planks' },
      ],
      waves: [
        ['knife', 'sling', 'scrapper'],
        ['jackal', 'grunt', 'jackal'],
        ['sling', 'sling', 'scrapper'],
        ['scrapper', 'jackal', 'knife', 'sling'],
      ],
    },
    { boss: 'colossus', label: 'Root Hollow' },
  ],
};
