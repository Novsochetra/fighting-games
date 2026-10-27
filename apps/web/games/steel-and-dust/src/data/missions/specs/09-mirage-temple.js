import { dais, mound, ramp } from '../ground-shapes.js';

export const MIRAGE_TEMPLE = {
  name: 'Mirage Temple',
  theme: 'mirageTemple',
  boss: 'pharaoh',
  reinforcements: ['ghoul', 'tombguard', 'witch'],
  crates: ['sword', 'ration', 'axe', 'spear', 'ration', 'sword'],
  entry: 'foundryGateBroken',
  endWall: 'templeDoor',
  zones: [
    {
      screens: 2,
      ground: [...mound(90, 340, 24, 80), ...mound(500, 700, 10, 50)],
      platforms: [{ at: 170, width: 80, rise: 30, kind: 'slab' }],
      boulders: [340],
      waves: [
        ['ghoul', 'ghoul', 'ghoul'],
        ['tombguard', 'ghoul', 'witch'],
        ['tombguard', 'tombguard', 'ghoul', 'spitter'],
      ],
    },
    {
      screens: 3,
      ground: [
        ...dais(70, [
          [18, 8],
          [18, 16],
          [18, 24],
          [70, 32],
        ]),
        ...ramp(480, 640, 20),
        ...mound(830, 1080, 14, 56),
      ],
      platforms: [
        { at: 140, width: 80, rise: 28, kind: 'slab' },
        { at: 660, width: 80, rise: 30, kind: 'slab' },
      ],
      spikeTraps: [366],
      waves: [
        ['ghoul', 'witch', 'assassin'],
        ['tombguard', 'ghoul', 'sentry'],
        ['ghoul', 'ghoul', 'monk'],
        ['tombguard', 'witch', 'ghoul', 'scorpion'],
      ],
    },
    { boss: 'cobra', label: 'Serpent Shrine', ground: mound(-290, -140, 12, 40) },
    {
      screens: 2,
      ground: [...ramp(-270, -150, 16), ...mound(60, 330, 30, 90), ...mound(480, 720, 12, 48)],
      platforms: [{ at: 160, width: 80, rise: 30, kind: 'slab' }],
      spikeTraps: [406],
      boulders: [196],
      waves: [
        ['ghoul', 'tombguard', 'vulture'],
        ['witch', 'witch', 'ghoul'],
        ['tombguard', 'ghoul', 'juggernaut', 'spitter'],
      ],
    },
    {
      screens: 3,
      ground: [
        ...dais(60, [
          [16, 8],
          [16, 16],
          [16, 24],
          [16, 32],
          [90, 40],
        ]),
        ...mound(480, 740, 20, 60),
        ...mound(820, 1060, 12, 48),
      ],
      platforms: [{ at: 560, width: 80, rise: 28, kind: 'slab' }],
      spikeTraps: [380],
      boulders: [728],
      waves: [
        ['ghoul', 'ghoul', 'tombguard'],
        ['assassin', 'witch', 'ghoul'],
        ['tombguard', 'tombguard', 'monk'],
        ['ghoul', 'tombguard', 'witch', 'ghoul'],
      ],
    },
    {
      boss: 'pharaoh',
      label: 'Sun Throne',
      ground: dais(-290, [
        [14, 8],
        [60, 16],
      ]),
    },
  ],
};
