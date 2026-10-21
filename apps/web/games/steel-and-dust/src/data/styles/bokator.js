import { BOKATOR_TECHNIQUES } from './techniques/bokator.js';

// close and hard: quick elbows and knees that land heavy, and finishers send a golden lion pouncing
export const BOKATOR_STYLE = {
  name: "Lion's Way",
  summary: 'Quick, heavy-handed hits. Finishers send a golden lion pouncing on the raiders ahead.',
  tempo: { startup: 0.95, recovery: 0.9, damage: 1.1, hitstop: 1 },
  moves: {
    L4: { lions: 1 },
    DA: { lions: 1 },
    K3: { lions: 1 },
    C2: { lions: 2 },
  },
  techniques: BOKATOR_TECHNIQUES,
};
