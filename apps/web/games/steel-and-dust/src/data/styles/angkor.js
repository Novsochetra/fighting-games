import { ANGKOR_TECHNIQUES } from './techniques/angkor.js';

// steady as the ranks carved on the Bayon: long, hard cuts, a first heavy that holds through blows,
// and finishers that call carved soldiers out of the stone to thrust at the raiders ahead
export const ANGKOR_STYLE = {
  name: 'Bayon Ranks',
  summary:
    'Long, hard cuts that hold their ground. Finishers call carved soldiers out of the stone.',
  tempo: { startup: 1.05, recovery: 1, damage: 1.15, hitstop: 1, reach: 4 },
  moves: {
    L4: { soldiers: 1 },
    K1: { armor: true },
    K3: { soldiers: 2 },
    DA: { soldiers: 1 },
    C2: { soldiers: 3 },
  },
  techniques: ANGKOR_TECHNIQUES,
};
