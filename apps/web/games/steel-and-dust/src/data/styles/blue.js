import { BLUE_TECHNIQUES } from './techniques/blue.js';

// long reach and exact timing: heavy cuts freeze raiders solid until the ice shatters
export const BLUE_STYLE = {
  name: 'Frost Iai',
  summary: 'Long reach, slow recovery. Heavy cuts freeze raiders solid, then the ice shatters.',
  tempo: { startup: 0.9, recovery: 1.15, damage: 1.1, reach: 8 },
  moves: {
    L4: { freeze: 40 },
    K1: { freeze: 36 },
    K3: { freeze: 40 },
    C1: { freeze: 52 },
    AK: { freeze: 34 },
  },
  techniques: BLUE_TECHNIQUES,
};
