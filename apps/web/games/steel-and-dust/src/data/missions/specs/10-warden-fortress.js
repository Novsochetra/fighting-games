import { mound, ramp } from '../ground-shapes.js';

// fortress stairs: a flight of walkable steps up to a landing and a flight back down
function flight(from, { step, rises, landing }) {
  const points = [[from, 0]];
  let x = from;
  for (const rise of rises) {
    points.push([x, rise], [x + step, rise]);
    x += step;
  }
  x += landing;
  points.push([x, rises.at(-1)]);
  for (const rise of rises.slice(0, -1).reverse()) {
    points.push([x, rise], [x + step, rise]);
    x += step;
  }
  points.push([x, 0]);
  return points;
}

const deck = (at, rise) => ({ at, width: 80, rise, kind: 'rampart' });

// the cliff road climbs from the temple ruins through the Outer Gate and the Inner Keep, and up a
// last flight of stairs to the Warden Hall, which stands 16px above the road
export const WARDEN_FORTRESS = {
  name: "Warden's Fortress",
  theme: 'wardenFortress',
  boss: 'brute',
  reinforcements: ['grunt', 'knife', 'sling'],
  crates: ['axe', 'ration', 'sword', 'ration', 'spear', 'ration', 'axe'],
  props: [],
  entry: 'templeDoorBroken',
  endWall: 'wardenGate',
  zones: [
    {
      screens: 2,
      ground: [
        [80, 0],
        [200, 24],
        [250, 24],
        [250, 16],
        [280, 16],
        [280, 8],
        [310, 8],
        [310, 0],
        ...mound(500, 700, 12, 48),
      ],
      platforms: [deck(190, 26)],
      waves: [
        ['shield', 'grunt', 'knife'],
        ['sentry', 'stoker', 'jackal'],
        ['shield', 'juggernaut', 'sling', 'knife'],
      ],
    },
    {
      screens: 3,
      ground: [
        ...mound(-270, -170, 10, 30),
        ...flight(70, { step: 30, rises: [8, 16, 24, 32], landing: 100 }),
        ...mound(560, 740, 24, 60),
        ...mound(820, 1060, 14, 56),
      ],
      platforms: [deck(190, 26), deck(610, 28)],
      waves: [
        ['assassin', 'hound', 'bomber'],
        ['tombguard', 'ghoul', 'spitter'],
        ['monk', 'vulture', 'witch'],
        ['juggernaut', 'shield', 'sentry', 'assassin'],
      ],
    },
    { boss: 'ironhorn', label: 'Outer Gate', ground: mound(-260, -160, 10, 30) },
    {
      screens: 3,
      ground: [
        ...mound(-290, -190, 12, 36),
        ...ramp(60, 230, 24),
        ...flight(470, { step: 26, rises: [8, 16, 24], landing: 60 }),
        ...mound(830, 1070, 12, 60),
      ],
      platforms: [deck(260, 28)],
      waves: [
        ['scorpion', 'scorpion', 'stoker'],
        ['witch', 'tombguard', 'hound'],
        ['bomber', 'sentry', 'monk'],
        ['juggernaut', 'stoker', 'shield', 'spitter'],
      ],
    },
    { boss: 'queen', label: 'Inner Keep' },
    {
      screens: 2,
      ground: [
        ...mound(-280, -170, 14, 40),
        ...mound(60, 330, 36, 90),
        ...mound(480, 690, 12, 48),
        [770, 0],
        [770, 8],
        [800, 8],
        [800, 16],
        [1068, 16],
      ],
      platforms: [deck(150, 26)],
      waves: [
        ['assassin', 'monk', 'vulture', 'knife'],
        ['juggernaut', 'shield', 'witch', 'sentry'],
      ],
    },
    {
      boss: 'brute',
      label: 'Warden Hall',
      ground: [
        [0, 16],
        [384, 16],
      ],
    },
  ],
};
