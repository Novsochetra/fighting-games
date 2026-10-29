import { dropIn } from '../ambushes.js';
import { bank, ramp, stairs } from '../ground-shapes.js';

export const ANGKOR_WAT = {
  name: 'Angkor Wat',
  theme: 'angkorWat',
  boss: 'naga',
  reinforcements: ['spitter', 'monk', 'tombguard'],
  crates: ['spear', 'ration', 'sword', 'ration', 'axe', 'ration', 'sword'],
  props: [],
  entry: 'wardenGateBroken',
  endWall: 'templeGate',
  zones: [
    {
      label: 'Naga Causeway',
      screens: 2,
      ground: [
        ...ramp(50, 98, 16),
        ...bank(98, 210, 16),
        ...stairs(270, [
          [12, 8],
          [610, 16],
          [14, 8],
        ]),
      ],
      // a breach in the causeway down to the moat: a raider knocked into the water is out at once.
      // It stays clear of the screen the last wave locks, so no raider walks in over it
      moats: [[310, 354]],
      platforms: [
        { at: 118, width: 80, rise: 28, kind: 'lintel' },
        { at: 476, width: 80, rise: 24, kind: 'lintel' },
        { at: 640, width: 80, rise: 32, kind: 'lintel' },
      ],
      waves: [
        ['monk', 'witch', 'tombguard'],
        ['assassin', 'sentry', 'monk', 'vulture'],
        ['juggernaut', 'sentry', 'tombguard', 'witch'],
      ],
    },
    {
      label: 'Gallery of Bas-Reliefs',
      screens: 3,
      ground: [
        ...stairs(56, [
          [12, 8],
          [12, 16],
          [140, 24],
          [96, 36],
          [40, 20],
        ]),
        ...stairs(560, [
          [14, 8],
          [14, 16],
          [14, 24],
          [80, 32],
          [14, 24],
          [14, 16],
          [14, 8],
        ]),
      ],
      platforms: [
        { at: 128, width: 80, rise: 28, kind: 'lintel' },
        { at: 470, width: 80, rise: 30, kind: 'lintel' },
        { at: 800, width: 80, rise: 30, kind: 'lintel' },
        { at: 1010, width: 80, rise: 26, kind: 'lintel' },
      ],
      waves: [
        // the strangler fig behind the balustrade is in sight as the gallery opens
        dropIn(['assassin', 'monk', 'assassin']),
        ['assassin', 'sentry', 'shield', 'spitter'],
        ['monk', 'spitter', 'juggernaut', 'vulture'],
        ['tombguard', 'sentry', 'assassin', 'witch'],
      ],
    },
    {
      boss: 'djinn',
      label: 'Cruciform Cloister',
      ground: stairs(-250, [
        [12, 8],
        [70, 16],
        [12, 8],
      ]),
    },
    {
      label: 'Bakan Stairs',
      screens: 2,
      // the courtyard behind the stairs runs on past the end of the road, so the sanctuary
      // stands up on it
      ground: [
        ...stairs(-240, [
          [20, 12],
          [60, 24],
          [20, 12],
        ]),
        ...stairs(50, [
          [22, 12],
          [22, 24],
          [156, 36],
          [40, 24],
          [1200, 16],
        ]),
      ],
      platforms: [
        { at: 130, width: 80, rise: 24, kind: 'lintel' },
        { at: 470, width: 80, rise: 26, kind: 'lintel' },
        { at: 646, width: 80, rise: 30, kind: 'lintel' },
      ],
      waves: [
        ['monk', 'spitter', 'vulture', 'sentry'],
        ['juggernaut', 'witch', 'assassin', 'monk'],
        ['tombguard', 'sentry', 'juggernaut', 'spitter'],
      ],
    },
    { boss: 'naga', label: 'Bakan Sanctuary' },
  ],
};
