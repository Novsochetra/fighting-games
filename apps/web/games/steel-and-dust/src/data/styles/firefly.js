import { FIREFLY_TECHNIQUES } from './techniques/firefly.js';

// fast and light: the third hit becomes a three-hit flurry and finishers loose homing fireflies
export const FIREFLY_STYLE = {
  name: 'Swarm Dance',
  summary: 'Quick, light hits. The third hit is a flurry; finishers loose homing fireflies.',
  tempo: { startup: 0.75, recovery: 0.8, damage: 0.85, hitstop: -1 },
  moves: {
    L3: { flurry: 3, sprite: ['spin_slash', 3] },
    L4: { fireflies: 2 },
    L5: { fireflies: 3 },
    K3: { fireflies: 4 },
    C2: { fireflies: 6 },
    AL3: { fireflies: 2 },
  },
  techniques: FIREFLY_TECHNIQUES,
};
