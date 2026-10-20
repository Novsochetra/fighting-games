import { bank, mound, ramp, stairs } from '../ground-shapes.js';

export const OLD_GROVE = {
  name: 'Old Grove',
  theme: 'oldGrove',
  boss: 'colossus',
  reinforcements: ['scrapper', 'jackal', 'sling'],
  crates: ['ration', 'spear', 'sword', 'ration', 'axe'],
  props: [],
  endWall: 'palisade',
  zones: [
    {
      screens: 2,
      ground: [...mound(60, 340, 28, 84), ...mound(460, 700, 12, 48)],
      platforms: [{ at: 160, width: 80, rise: 26, kind: 'planks' }],
      waves: [
        ['scrapper', 'grunt', 'scrapper'],
        ['jackal', 'grunt'],
        ['scrapper', 'jackal', 'grunt', 'knife'],
      ],
    },
    {
      screens: 2,
      ground: [...bank(-260, -150, 20), ...ramp(80, 300, 24), ...mound(470, 690, 14, 56)],
      platforms: [{ at: 330, width: 80, rise: 40, kind: 'planks' }],
      waves: [
        ['sling', 'grunt', 'grunt'],
        ['jackal', 'jackal', 'scrapper'],
        ['sling', 'scrapper', 'knife', 'jackal'],
      ],
    },
    {
      screens: 3,
      ground: [
        ...stairs(-240, [
          [50, 12],
          [50, 22],
        ]),
        ...mound(80, 360, 36, 108),
        ...bank(480, 600, 20),
        ...mound(820, 1090, 16, 64),
      ],
      platforms: [
        { at: 640, width: 80, rise: 26, kind: 'planks' },
        { at: 900, width: 80, rise: 34, kind: 'planks' },
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
