import { dropIn } from '../ambushes.js';
import { contour, ledge, mound, terrace } from '../ground-shapes.js';

export const RAIDER_CAMP = {
  name: 'Raider Camp',
  theme: 'raiderCamp',
  boss: 'cobra',
  reinforcements: ['spitter', 'knife', 'shield'],
  crates: ['sword', 'ration', 'spear', 'axe', 'ration'],
  endWall: 'palisade',
  zones: [
    {
      screens: 2,
      // the camp's earth rampart, jumped at its front and walked off behind; spitters man the
      // lookout past it
      ground: [...ledge(80, 270, 16, 60)],
      platforms: [
        { at: 300, width: 80, rise: 40, kind: 'planks' },
        { at: 560, width: 80, rise: 30, kind: 'planks' },
      ],
      // the camp's black powder, stacked where the raiders work
      kegs: [420, 650],
      campfires: [520],
      waves: [
        ['knife', 'spitter', 'grunt'],
        ['shield', 'grunt', 'knife'],
        ['spitter', 'shield', 'jackal', 'knife'],
      ],
    },
    {
      screens: 2,
      // a ditch between two earthworks, with a deck across it for the spitters; the lookout tower
      // stays in sight all through it, and its raiders leap off it at the hero
      ground: [...terrace(60, 180, 18, 60), ...ledge(270, 380, 14, 50)],
      platforms: [{ at: 186, width: 80, rise: 36, kind: 'planks' }],
      kegs: [470, 640],
      campfires: [555],
      waves: [
        ['spitter', 'spitter', 'hound'],
        dropIn(['knife', 'scrapper', 'jackal']),
        ['knife', 'shield', 'spitter', 'bomber'],
      ],
    },
    {
      screens: 3,
      // the stockpile mound with a step down its back, a deck, a rampart and a low rise to the
      // lock
      ground: [
        ...mound(-240, -150, 8, 30),
        ...contour(70, [
          [80, 24],
          [120, 24],
          [0, 12],
          [60, 12],
          [40, 0],
        ]),
        ...ledge(610, 740, 16, 50),
        ...mound(840, 1010, 10, 50),
      ],
      platforms: [
        { at: 500, width: 80, rise: 30, kind: 'planks' },
        { at: 160, width: 80, rise: 30, kind: 'planks' },
        { at: 1030, width: 80, rise: 34, kind: 'planks' },
      ],
      kegs: [450, 1080],
      campfires: [390],
      waves: [
        ['hound', 'knife', 'spitter'],
        ['shield', 'shield', 'sling'],
        ['spitter', 'jackal', 'bomber'],
        ['shield', 'spitter', 'knife', 'hound'],
      ],
    },
    {
      screens: 2,
      // earth steps up to the gate road and a slope back down
      ground: [
        ...contour(60, [
          [0, 12],
          [70, 12],
          [0, 22],
          [80, 22],
          [60, 10],
          [40, 0],
        ]),
      ],
      platforms: [{ at: 330, width: 80, rise: 30, kind: 'planks' }],
      kegs: [430],
      campfires: [560],
      waves: [
        ['spitter', 'sling', 'scrapper', 'knife'],
        ['shield', 'hound', 'spitter', 'jackal'],
      ],
    },
    { boss: 'cobra', label: "Serpent's Tent" },
  ],
};
