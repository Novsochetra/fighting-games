import { bank, mound, ramp } from '../ground-shapes.js';

export const RAIDER_CAMP = {
  name: 'Raider Camp',
  theme: 'raiderCamp',
  boss: 'cobra',
  reinforcements: ['spitter', 'knife', 'shield'],
  crates: ['sword', 'ration', 'spear', 'axe', 'ration'],
  props: [],
  endWall: 'palisade',
  zones: [
    {
      screens: 2,
      ground: [...mound(60, 300, 20, 60)],
      platforms: [
        { at: 340, width: 80, rise: 36, kind: 'planks' },
        { at: 520, width: 80, rise: 26, kind: 'planks' },
      ],
      waves: [
        ['knife', 'spitter', 'grunt'],
        ['shield', 'grunt', 'knife'],
        ['spitter', 'shield', 'jackal', 'knife'],
      ],
    },
    {
      screens: 2,
      ground: [...bank(-260, -150, 16), ...ramp(60, 260, 24), ...mound(470, 700, 12, 48)],
      platforms: [{ at: 290, width: 80, rise: 40, kind: 'planks' }],
      waves: [
        ['spitter', 'spitter', 'hound'],
        ['shield', 'sling', 'scrapper'],
        ['knife', 'shield', 'spitter', 'bomber'],
      ],
    },
    {
      screens: 3,
      ground: [...mound(60, 330, 30, 90), ...bank(470, 590, 20), ...mound(830, 1080, 14, 56)],
      platforms: [
        { at: 150, width: 80, rise: 32, kind: 'planks' },
        { at: 620, width: 80, rise: 26, kind: 'planks' },
        { at: 900, width: 80, rise: 34, kind: 'planks' },
      ],
      waves: [
        ['hound', 'knife', 'spitter'],
        ['shield', 'shield', 'sling'],
        ['spitter', 'jackal', 'bomber'],
        ['shield', 'spitter', 'knife', 'hound'],
      ],
    },
    {
      screens: 2,
      ground: [...ramp(-260, -150, 18), ...mound(80, 320, 24, 72), ...mound(470, 690, 10, 40)],
      platforms: [{ at: 160, width: 80, rise: 30, kind: 'planks' }],
      waves: [
        ['spitter', 'sling', 'scrapper', 'knife'],
        ['shield', 'hound', 'spitter', 'jackal'],
      ],
    },
    { boss: 'cobra', label: "Serpent's Tent" },
  ],
};
