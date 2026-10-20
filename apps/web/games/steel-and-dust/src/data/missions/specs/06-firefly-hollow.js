import { contour, ledge, mound, ramp, terrace } from '../ground-shapes.js';

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
      // mossy stones: a slope, a step up to the old wall's top and a long slope down
      ground: [
        ...contour(60, [
          [60, 14],
          [80, 14],
          [0, 24],
          [70, 24],
          [80, 0],
        ]),
      ],
      platforms: [{ at: 476, width: 80, rise: 30, kind: 'planks-night' }],
      waves: [
        ['monk', 'grunt', 'monk'],
        ['vulture', 'hound', 'knife'],
        ['monk', 'vulture', 'scorpion', 'hound'],
      ],
    },
    {
      screens: 3,
      // the hollow itself: a deck over its floor between two shoulders, then the great mound
      ground: [...terrace(60, 220, 24, 90), ...ledge(330, 420, 16, 40), ...mound(500, 740, 28, 90)],
      platforms: [
        { at: 236, width: 80, rise: 36, kind: 'planks-night' },
        { at: 860, width: 80, rise: 32, kind: 'planks-night' },
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
      // a crossing: a slope to a drop, a deck over the gap and a ledge on the far side
      ground: [...ramp(70, 200, 20), ...ledge(300, 380, 14, 40), ...mound(480, 680, 10, 60)],
      platforms: [{ at: 210, width: 80, rise: 36, kind: 'planks-night' }],
      waves: [
        ['monk', 'sentry', 'assassin'],
        ['hound', 'hound', 'vulture'],
        ['assassin', 'monk', 'sentry', 'shield'],
      ],
    },
    {
      screens: 2,
      // the bone pens' earthwork: up a slope, a step to its top, broken steps down the back
      ground: [
        ...mound(-250, -150, 10, 40),
        ...contour(60, [
          [90, 16],
          [0, 24],
          [100, 24],
          [0, 12],
          [50, 12],
          [50, 0],
        ]),
      ],
      platforms: [{ at: 476, width: 80, rise: 28, kind: 'planks-night' }],
      waves: [
        ['vulture', 'monk', 'assassin', 'spitter'],
        ['hound', 'assassin', 'monk', 'vulture'],
      ],
    },
    { boss: 'gnoll', label: 'Bone Pens' },
  ],
};
