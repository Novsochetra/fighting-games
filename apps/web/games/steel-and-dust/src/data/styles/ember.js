import { EMBER_TECHNIQUES } from './techniques/ember.js';

// quick and fierce: finishers raise pillars of flame ahead, heavy cuts leave raiders burning
export const EMBER_STYLE = {
  name: 'Wildfire',
  summary: 'Quick, fierce hits. Finishers raise flame pillars; heavy cuts set raiders burning.',
  tempo: { startup: 0.9, recovery: 0.95, damage: 1.05 },
  moves: {
    L4: { pillars: 2 },
    K1: { burn: 120 },
    K2: { burn: 120 },
    K3: { pillars: 3, burn: 150 },
    C2: { pillars: 4 },
    ADK: { pillars: 1, pillarRing: true },
  },
  techniques: EMBER_TECHNIQUES,
};
