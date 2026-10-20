import { contour, ledge, mound } from '../ground-shapes.js';

export const BAMBOO_PASS = {
  name: 'Bamboo Pass',
  theme: 'bambooPass',
  boss: 'ironhorn',
  reinforcements: ['hound', 'grunt', 'bomber'],
  crates: ['axe', 'ration', 'sword', 'spear', 'ration'],
  endWall: 'palisade',
  zones: [
    {
      screens: 2,
      // shrine steps low enough to walk, up to a terrace and down the far side; bombers get a deck
      ground: [
        ...contour(60, [
          [0, 8],
          [50, 8],
          [0, 16],
          [50, 16],
          [0, 24],
          [80, 24],
          [0, 16],
          [40, 16],
          [0, 8],
          [40, 8],
          [0, 0],
        ]),
      ],
      platforms: [{ at: 340, width: 80, rise: 30, kind: 'planks' }],
      waves: [
        ['hound', 'grunt', 'hound'],
        ['bomber', 'grunt', 'knife'],
        ['hound', 'bomber', 'scrapper', 'grunt'],
      ],
    },
    {
      screens: 2,
      // the pass: a slope and a step up to a cut, a drop into the gully, a soft rise in the lock
      ground: [
        ...contour(-250, [
          [0, 8],
          [70, 8],
          [0, 0],
        ]),
        ...contour(70, [
          [90, 14],
          [0, 22],
          [110, 22],
          [0, 0],
        ]),
        ...mound(540, 728, 12, 60),
      ],
      platforms: [{ at: 285, width: 80, rise: 34, kind: 'planks' }],
      waves: [
        ['jackal', 'hound', 'sling'],
        ['bomber', 'bomber', 'grunt'],
        ['hound', 'hound', 'knife', 'sling'],
      ],
    },
    {
      screens: 3,
      // the great stair to the upper terrace and its long slope down, then a ledge to jump
      ground: [
        ...contour(60, [
          [0, 8],
          [36, 8],
          [0, 16],
          [36, 16],
          [0, 24],
          [36, 24],
          [0, 32],
          [80, 32],
          [60, 12],
          [50, 12],
          [50, 0],
        ]),
        ...ledge(560, 720, 14, 60),
      ],
      platforms: [
        { at: 470, width: 80, rise: 36, kind: 'planks' },
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
