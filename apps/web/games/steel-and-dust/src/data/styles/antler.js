import { ANTLER_TECHNIQUES } from './techniques/antler.js';

// slow and heavy: armored rams and stomps, and the third hit sends a spirit stag charging
export const ANTLER_STYLE = {
  name: 'Stampede',
  summary: 'Slow, heavy, armored. The third hit is a ram that sends a spirit stag charging.',
  tempo: { startup: 1.2, recovery: 1.1, damage: 1.25, hitstop: 1 },
  moves: {
    L3: { armor: true, knockdown: true, forward: 3.4, stags: 1, sprite: ['thrust', 3] },
    K1: { armor: true, shockwave: true },
    UK: { armor: true },
    DA: { armor: true, stags: 1 },
    C2: { stags: 3 },
  },
  techniques: ANTLER_TECHNIQUES,
};
