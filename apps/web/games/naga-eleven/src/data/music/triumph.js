import { REST_BAR, repeat } from './bars.js';

// the trophy: the roneat in octaves and rolls, every drum of the band
export const TRIUMPH = {
  id: 'triumph',
  bpm: 120,
  loop: true,
  level: 1,
  scale: ['F', 'G', 'A', 'C', 'D'],
  bars: 4,
  tracks: {
    roneat: [
      'F5+ . A5+ . C6+ . F6+ - - - D6+ . C6+ . A5+ .',
      'G5+ . A5+ . C6+ . D6+ . C6+~ - - - - - - -',
      'F5+ . A5+ . C6+ . F6+ - G6+ . A6+ . G6+ . F6+ .',
      'D6+ . C6+ . A5+ . G5+ . F5+~ - - - - - - -',
    ],
    tro: [
      ...repeat([REST_BAR], 2),
      'F5 - - - - - - - A5 - - - - - - -',
      'C6 - - - - - - - - - - - . . . .',
    ],
    kong: [
      'F4 . . . C5 . . . F4 . . . C5 . . .',
      'G4 . . . D5 . . . C5 . . . G4 . . .',
      'F4 . . . A4 . . . C5 . . . F5 . . .',
      'D5 . . . C5 . . . G4 . . . F4 . . .',
    ],
    bass: [
      'F2 . . F2 . . C3 . F2 . . F2 . . C3 .',
      'G2 . . G2 . . D3 . C3 . . C3 . . G2 .',
      'F2 . . F2 . . C3 . F2 . . F2 . . C3 .',
      'D3 . . D3 . . A2 . F2 . . C3 . F2 . .',
    ],
    skor: [...repeat(['T . . S . . T . T . S . T . S .'], 3), 'T . S . T . S . T S T S T S T S'],
    chhing: repeat(['x . o . x . o . x . o . x . o .'], 4),
  },
};
