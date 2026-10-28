import { burrowIn } from '../ambushes.js';
import { mound, ramp, stairs } from '../ground-shapes.js';

// a sand slope up onto a red-rock ledge that steps back down to the road
function ledge(from, { top, rise, steps }) {
  return [...ramp(from, top, rise), ...stairs(top, steps)];
}

export const SANDSTORM_PASS = {
  name: 'Sandstorm Pass',
  theme: 'sandstormPass',
  boss: 'djinn',
  reinforcements: ['witch', 'assassin', 'monk'],
  crates: ['axe', 'ration', 'sword', 'ration', 'spear', 'ration'],
  entry: 'palisadeBroken',
  endWall: 'canyonBarricade',
  zones: [
    {
      screens: 2,
      ground: [...mound(60, 330, 24, 72), ...mound(470, 720, 10, 40)],
      waves: [
        ['witch', 'grunt', 'assassin'],
        ['juggernaut', 'knife'],
        ['witch', 'juggernaut', 'monk', 'jackal'],
      ],
    },
    {
      screens: 3,
      ground: [
        ...mound(-270, -160, 10, 40),
        ...ledge(60, {
          top: 200,
          rise: 24,
          steps: [
            [60, 24],
            [60, 12],
          ],
        }),
        ...mound(820, 1080, 12, 48),
      ],
      platforms: [{ at: 540, width: 80, rise: 30, kind: 'scaffold' }],
      waves: [
        ['assassin', 'assassin', 'sling'],
        burrowIn(['scorpion', 'jackal', 'scorpion']),
        ['juggernaut', 'monk', 'bomber'],
        ['witch', 'witch', 'juggernaut', 'assassin'],
      ],
    },
    {
      screens: 2,
      ground: [
        ...ramp(-260, -150, 20),
        ...stairs(60, [
          [50, 10],
          [90, 20],
        ]),
        ...mound(470, 720, 14, 56),
      ],
      platforms: [{ at: 236, width: 80, rise: 28, kind: 'scaffold' }],
      waves: [
        ['hound', 'monk', 'witch'],
        ['juggernaut', 'sentry', 'vulture'],
        ['assassin', 'witch', 'spitter', 'juggernaut'],
      ],
    },
    {
      screens: 3,
      ground: [
        ...mound(60, 380, 32, 96),
        ...stairs(480, [
          [50, 12],
          [60, 24],
          [50, 12],
        ]),
        ...mound(820, 1100, 12, 48),
      ],
      platforms: [{ at: 180, width: 80, rise: 28, kind: 'scaffold' }],
      waves: [
        ['monk', 'monk', 'witch'],
        ['juggernaut', 'shield', 'sling'],
        ['assassin', 'vulture', 'hound'],
        ['witch', 'juggernaut', 'monk', 'assassin'],
      ],
    },
    { boss: 'djinn', label: 'Eye of the Storm', ground: mound(-270, -150, 16, 48) },
  ],
};
