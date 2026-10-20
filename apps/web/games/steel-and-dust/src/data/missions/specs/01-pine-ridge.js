import { bank, mound, ramp } from '../ground-shapes.js';

export const PINE_RIDGE = {
  name: 'Pine Ridge',
  theme: 'pineRidge',
  boss: 'khan',
  reinforcements: ['grunt', 'knife', 'scrapper'],
  crates: ['sword', 'ration', 'spear', 'ration', 'axe'],
  props: [],
  endWall: 'palisade',
  zones: [
    {
      screens: 1,
      waves: [
        ['grunt', 'grunt', 'grunt'],
        ['grunt', 'scrapper', 'grunt'],
      ],
    },
    {
      screens: 2,
      ground: [...mound(-260, -140, 12, 36), ...mound(70, 330, 24, 72), ...mound(470, 700, 12, 48)],
      platforms: [{ at: 170, width: 80, rise: 32, kind: 'planks' }],
      waves: [
        ['knife', 'grunt'],
        ['grunt', 'scrapper', 'grunt'],
        ['knife', 'scrapper', 'grunt', 'grunt'],
      ],
    },
    {
      screens: 3,
      ground: [
        ...bank(-250, -150, 16),
        ...ramp(60, 260, 24),
        ...mound(470, 700, 20, 60),
        ...mound(820, 1080, 14, 56),
      ],
      platforms: [
        { at: 290, width: 80, rise: 26, kind: 'planks' },
        { at: 880, width: 80, rise: 36, kind: 'planks' },
      ],
      waves: [
        ['grunt', 'grunt', 'knife'],
        ['scrapper', 'knife'],
        ['grunt', 'scrapper', 'grunt'],
        ['knife', 'knife', 'scrapper', 'grunt'],
      ],
    },
    { boss: 'khan', label: 'Ridge Lookout' },
  ],
};
