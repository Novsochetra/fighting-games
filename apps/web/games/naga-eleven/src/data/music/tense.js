import { repeat } from './bars.js';

// danger close: the skor drives, the roneat rolls low and the tro holds its breath
export const TENSE = {
  id: 'tense',
  bpm: 132,
  loop: true,
  level: 0.9,
  scale: ['E', 'G', 'A', 'B', 'D'],
  bars: 4,
  tracks: {
    roneat: [
      'E4~ - - - . . E4 . G4~ - - - . . E4 .',
      'A4~ - - - . . G4 . E4~ - - - . . D4 .',
      'E4~ - - - . . E4 . G4~ - - - . . A4 .',
      'B4+~ - - - A4+ . G4+ . A4+~ - - - B4+ . D5+ .',
    ],
    tro: [
      'E5 - - - - - - - - - - - - - - -',
      'D5 - - - - - - - B4 - - - - - - -',
      'E5 - - - - - - - G5 - - - - - - -',
      'A5 - - - - - - - B5 - - - - - - -',
    ],
    bass: [
      'E2 . E2 . . E2 . . E2 . E2 . . E2 . .',
      'A2 . A2 . . A2 . . E2 . E2 . . D2 . .',
      'E2 . E2 . . E2 . . E2 . E2 . . E2 . .',
      'B2 . B2 . . B2 . . A2 . A2 . . B2 . D3',
    ],
    skor: repeat(['T . . T . . S . T . T . S . . .'], 4),
    chhing: repeat(['x . x . x . x . x . x . x . x .'], 4),
  },
};
