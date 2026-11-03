import { repeat } from './bars.js';

// something to reach for: lines that climb, the skor walking under them
export const HOPE = {
  id: 'hope',
  bpm: 92,
  loop: true,
  level: 0.95,
  scale: ['C', 'D', 'E', 'G', 'A'],
  bars: 4,
  tracks: {
    roneat: [
      'C5 . D5 . E5 . G5 . A5 . G5 . E5 . G5 .',
      'A5 . C6 . D6 . C6 . A5 - - - G5 . . .',
      'E5 . G5 . A5 . C6 . D6 . E6 . G6 - - -',
      'E6+~ - - - D6+ . C6+ . D6+~ - - - - - - -',
    ],
    tro: [
      'C5 - - - - - - - E5 - - - - - - -',
      'A4 - - - - - - - G4 - - - - - - -',
      'C5 - - - E5 - - - G5 - - - A5 - - -',
      'G5 - - - - - - - - - - - . . . .',
    ],
    kong: [
      'C4 . . . G4 . . . C5 . . . G4 . . .',
      'A3 . . . E4 . . . G3 . . . D4 . . .',
      'C4 . . . E4 . . . G4 . . . A4 . . .',
      'G3 . . . D4 . . . G4 . . . D4 . . .',
    ],
    bass: [
      'C2 . . . C2 . G2 . C2 . . . C2 . G2 .',
      'A2 . . . A2 . E2 . G2 . . . G2 . D2 .',
      'C2 . . . C2 . E2 . G2 . . . A2 . G2 .',
      'G2 . . . G2 . D2 . G2 . . . G2 . D2 .',
    ],
    skor: repeat(['t . . . S . . . t . t . S . . .'], 4),
    chhing: repeat(['x . o . x . o . x . o . x . o .'], 4),
  },
};
