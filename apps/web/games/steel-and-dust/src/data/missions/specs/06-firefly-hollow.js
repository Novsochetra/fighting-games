import { bank, mound, ramp, stairs } from '../ground-shapes.js';

export const FIREFLY_HOLLOW = {
  name: 'Firefly Hollow',
  theme: 'fireflyHollow',
  boss: 'gnoll',
  reinforcements: ['hound', 'monk', 'vulture'],
  crates: ['ration', 'sword', 'spear', 'ration', 'axe', 'ration'],
  props: [],
  endWall: 'palisade',
  zones: [
    {
      screens: 2,
      ground: [...mound(60, 330, 24, 72), ...mound(460, 700, 12, 48)],
      platforms: [{ at: 140, width: 80, rise: 26, kind: 'planks' }],
      waves: [
        ['monk', 'grunt', 'monk'],
        ['vulture', 'hound', 'knife'],
        ['monk', 'vulture', 'scorpion', 'hound'],
      ],
    },
    {
      screens: 3,
      ground: [
        ...bank(-260, -150, 16),
        ...ramp(60, 270, 24),
        ...mound(470, 760, 32, 96),
        ...mound(830, 1080, 12, 48),
      ],
      platforms: [
        { at: 300, width: 80, rise: 26, kind: 'planks' },
        { at: 570, width: 80, rise: 32, kind: 'planks' },
      ],
      waves: [
        ['assassin', 'monk', 'sling'],
        ['vulture', 'vulture', 'shield'],
        ['monk', 'assassin', 'bomber'],
        ['assassin', 'vulture', 'monk', 'hound'],
      ],
    },
    { boss: 'khan', label: 'Khan Returns' },
    {
      screens: 2,
      ground: [...mound(-260, -140, 12, 36), ...mound(80, 350, 28, 84), ...mound(470, 700, 12, 48)],
      platforms: [{ at: 170, width: 80, rise: 36, kind: 'planks' }],
      waves: [
        ['monk', 'sentry', 'assassin'],
        ['hound', 'hound', 'vulture'],
        ['assassin', 'monk', 'sentry', 'shield'],
      ],
    },
    {
      screens: 2,
      ground: [
        ...ramp(-260, -150, 20),
        ...stairs(70, [
          [70, 12],
          [70, 24],
          [60, 12],
        ]),
        ...mound(460, 700, 12, 48),
      ],
      platforms: [{ at: 300, width: 80, rise: 26, kind: 'planks' }],
      waves: [
        ['vulture', 'monk', 'assassin', 'spitter'],
        ['hound', 'assassin', 'monk', 'vulture'],
      ],
    },
    { boss: 'gnoll', label: 'Bone Pens' },
  ],
};
