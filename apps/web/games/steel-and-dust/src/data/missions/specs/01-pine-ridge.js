import { dropIn } from '../ambushes.js';
import { contour, ledge, mound } from '../ground-shapes.js';

export const PINE_RIDGE = {
  name: 'Pine Ridge',
  theme: 'pineRidge',
  boss: 'khan',
  reinforcements: ['grunt', 'knife', 'scrapper'],
  crates: ['sword', 'ration', 'spear', 'ration', 'axe'],
  endWall: 'palisade',
  zones: [
    {
      // a soft swell to meet the first raiders on
      screens: 1,
      ground: [...mound(150, 310, 8, 64)],
      waves: [
        ['grunt', 'grunt', 'grunt'],
        ['grunt', 'scrapper', 'grunt'],
      ],
    },
    {
      // a long climb to a knoll, a drop to its shelf and down again; a deck stands over the lock
      screens: 2,
      trees: [634],
      ground: [
        ...contour(60, [
          [110, 24],
          [110, 24],
          [0, 12],
          [60, 12],
          [50, 0],
        ]),
      ],
      platforms: [{ at: 520, width: 80, rise: 30, kind: 'planks' }],
      waves: [
        ['knife', 'grunt'],
        ['grunt', 'scrapper', 'grunt'],
        ['knife', 'scrapper', 'grunt', 'grunt'],
      ],
    },
    {
      // a hollow between two rocky shoulders, a deck over its floor, then the long rise to the
      // lookout
      screens: 3,
      nests: [740],
      ground: [
        ...mound(-250, -150, 10, 40),
        ...contour(60, [
          [90, 20],
          [110, 20],
          [0, 0],
        ]),
        ...ledge(470, 700, 16, 80),
        ...mound(800, 1100, 8, 110),
      ],
      platforms: [
        { at: 290, width: 80, rise: 34, kind: 'planks' },
        { at: 560, width: 80, rise: 28, kind: 'planks' },
      ],
      waves: [
        ['grunt', 'grunt', 'knife'],
        ['scrapper', 'knife'],
        dropIn(['grunt', 'knife', 'grunt']),
        ['knife', 'knife', 'scrapper', 'grunt'],
      ],
    },
    { boss: 'khan', label: 'Ridge Lookout' },
  ],
};
