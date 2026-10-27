import { mound, ramp, stairs } from '../ground-shapes.js';

// the foundry past the barricade: slag heaps to fight over, iron stairs up to the gantries and
// catwalks for the crossbows, and level ground before the Slag Gate and the Great Furnace
export const IRON_WORKS = {
  name: 'Iron Works',
  theme: 'ironWorks',
  boss: 'furnace',
  reinforcements: ['stoker', 'scrapper', 'sentry'],
  crates: ['spear', 'ration', 'axe', 'sword', 'ration', 'axe'],
  entry: 'canyonBarricadeBroken',
  endWall: 'foundryGate',
  zones: [
    {
      screens: 2,
      ground: [...mound(60, 320, 24, 72), ...mound(470, 700, 12, 48)],
      platforms: [{ at: 120, width: 80, rise: 32, kind: 'catwalk' }],
      hammers: [370],
      waves: [
        ['stoker', 'scrapper', 'stoker'],
        ['sentry', 'juggernaut', 'knife'],
        ['stoker', 'stoker', 'sentry', 'scrapper'],
      ],
    },
    {
      screens: 3,
      ground: [
        ...mound(-250, -140, 12, 36),
        ...stairs(70, [
          [60, 8],
          [60, 16],
          [70, 24],
          [60, 12],
        ]),
        ...ramp(500, 680, 20),
        ...mound(990, 1110, 12, 40),
      ],
      platforms: [
        { at: 230, width: 80, rise: 26, kind: 'catwalk' },
        { at: 600, width: 80, rise: 30, kind: 'catwalk' },
      ],
      hammers: [400],
      conveyors: [{ at: 830, segments: 2, direction: -1 }],
      waves: [
        ['bomber', 'stoker', 'jackal'],
        ['juggernaut', 'shield', 'sentry'],
        ['stoker', 'spitter', 'scrapper'],
        ['juggernaut', 'stoker', 'bomber', 'shield'],
      ],
    },
    { boss: 'colossus', label: 'Slag Gate', ground: [...mound(-260, -140, 10, 30)] },
    {
      screens: 2,
      ground: [...ramp(-260, -150, 18), ...mound(70, 340, 32, 80), ...mound(500, 720, 10, 40)],
      platforms: [
        { at: 130, width: 80, rise: 28, kind: 'catwalk' },
        { at: 360, width: 80, rise: 36, kind: 'catwalk' },
      ],
      waves: [
        ['stoker', 'assassin', 'sentry'],
        ['juggernaut', 'juggernaut', 'sling'],
        ['stoker', 'shield', 'witch', 'scrapper'],
      ],
    },
    {
      screens: 3,
      ground: [
        ...mound(-260, -150, 12, 36),
        ...stairs(60, [
          [50, 8],
          [50, 16],
          [50, 24],
          [90, 32],
          [50, 20],
          [50, 8],
        ]),
        ...ramp(520, 700, 24),
        ...mound(840, 1080, 12, 48),
      ],
      platforms: [
        { at: 228, width: 80, rise: 26, kind: 'catwalk' },
        { at: 580, width: 80, rise: 32, kind: 'catwalk' },
      ],
      waves: [
        ['bomber', 'bomber', 'stoker'],
        ['sentry', 'stoker', 'hound'],
        ['juggernaut', 'monk', 'shield'],
        ['stoker', 'juggernaut', 'sentry', 'stoker'],
      ],
    },
    { boss: 'furnace', label: 'Great Furnace', ground: [...ramp(-260, -150, 16)] },
  ],
};
