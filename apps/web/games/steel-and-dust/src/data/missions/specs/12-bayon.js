import { bank, mound, ramp, stairs } from '../ground-shapes.js';

export const BAYON = {
  name: 'Bayon',
  theme: 'bayon',
  boss: 'guardian',
  reinforcements: ['ghoul', 'assassin', 'witch'],
  crates: ['sword', 'ration', 'axe', 'ration', 'spear', 'ration', 'sword', 'axe'],
  props: [],
  entry: 'templeGateBroken',
  endWall: 'templeGate',
  zones: [
    {
      label: 'South Gate',
      screens: 2,
      ground: [...mound(56, 150, 10, 30), ...ramp(190, 250, 18)],
      platforms: [
        { at: 270, width: 80, rise: 30, kind: 'lintel' },
        { at: 488, width: 80, rise: 34, kind: 'lintel' },
        { at: 646, width: 80, rise: 26, kind: 'lintel' },
      ],
      waves: [
        ['ghoul', 'sentry', 'ghoul', 'tombguard'],
        ['assassin', 'witch', 'monk', 'vulture'],
        ['juggernaut', 'sentry', 'shield', 'witch'],
      ],
    },
    {
      label: 'Terrace of the Elephants',
      screens: 3,
      ground: [
        ...stairs(-240, [
          [30, 12],
          [40, 20],
          [30, 8],
        ]),
        ...stairs(60, [
          [12, 8],
          [12, 16],
          [260, 24],
          [12, 16],
          [12, 8],
        ]),
        ...mound(470, 560, 10, 30),
        ...mound(560, 690, 16, 40),
      ],
      platforms: [
        { at: 180, width: 80, rise: 26, kind: 'lintel' },
        { at: 520, width: 80, rise: 36, kind: 'lintel' },
        { at: 830, width: 80, rise: 30, kind: 'lintel' },
        { at: 1000, width: 80, rise: 24, kind: 'lintel' },
      ],
      waves: [
        ['vulture', 'sentry', 'tombguard', 'monk'],
        ['ghoul', 'witch', 'assassin', 'ghoul'],
        ['juggernaut', 'sentry', 'monk'],
        ['shield', 'witch', 'tombguard', 'assassin'],
      ],
    },
    {
      boss: 'pharaoh',
      label: 'Terrace of the Leper King',
      ground: stairs(-260, [
        [14, 12],
        [14, 24],
        [60, 12],
      ]),
    },
    {
      label: 'Gallery of the Cham Wars',
      screens: 3,
      ground: [
        ...mound(-250, -150, 10, 30),
        ...stairs(60, [
          [10, 8],
          [260, 16],
        ]),
        ...mound(470, 600, 12, 24),
        ...ramp(640, 720, 20),
      ],
      platforms: [
        { at: 120, width: 80, rise: 26, kind: 'lintel' },
        { at: 230, width: 80, rise: 30, kind: 'lintel' },
        { at: 850, width: 80, rise: 28, kind: 'lintel' },
        { at: 1030, width: 80, rise: 32, kind: 'lintel' },
      ],
      slabs: [400, 790, 980],
      waves: [
        ['monk', 'sentry', 'monk', 'vulture'],
        ['tombguard', 'witch', 'juggernaut'],
        ['assassin', 'sentry', 'ghoul', 'witch'],
        ['juggernaut', 'witch', 'tombguard', 'sentry'],
      ],
    },
    {
      boss: 'brute',
      label: 'Inner Gallery',
      ground: stairs(-250, [
        [16, 8],
        [16, 16],
        [50, 24],
        [16, 16],
        [16, 8],
      ]),
    },
    {
      label: 'Forest of Faces',
      screens: 3,
      ground: [
        ...bank(60, 140, 20),
        ...bank(260, 350, 24),
        ...mound(460, 560, 14, 28),
        ...stairs(600, [
          [16, 12],
          [60, 24],
          [16, 12],
        ]),
      ],
      platforms: [
        { at: 160, width: 80, rise: 32, kind: 'lintel' },
        { at: 520, width: 80, rise: 30, kind: 'lintel' },
        { at: 820, width: 80, rise: 34, kind: 'lintel' },
        { at: 990, width: 80, rise: 26, kind: 'lintel' },
      ],
      waves: [
        ['ghoul', 'sentry', 'assassin', 'witch'],
        ['juggernaut', 'vulture', 'tombguard', 'monk'],
        ['shield', 'witch', 'ghoul', 'sentry'],
        ['juggernaut', 'sentry', 'juggernaut', 'witch'],
      ],
    },
    { boss: 'guardian', label: 'Face of Bayon', ground: mound(-250, -170, 12, 24) },
  ],
};
