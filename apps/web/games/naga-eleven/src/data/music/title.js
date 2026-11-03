import { REST_BAR, repeat } from './bars.js';

// heroic and hopeful: the roneat in octaves over the gongs, the tro answering in the second half
export const TITLE = {
  id: 'title',
  bpm: 112,
  loop: true,
  level: 1,
  scale: ['D', 'E', 'F#', 'A', 'B'],
  bars: 8,
  tracks: {
    roneat: [
      'D5+ . . A5+ . . D6+ - E6+ . D6+ . B5+ . A5+ .',
      'B5+ . A5+ . F#5+ . E5+ . D5+~ - - - - - . .',
      'D5+ . . A5+ . . D6+ - E6+ . F#6+ . E6+ . D6+ .',
      'E6+~ - - - - - - - D6+ . B5+ . A5+ - - -',
      'B5 . A5 . B5 . D6 . E6 . D6 . B5 . A5 .',
      'F#5 . A5 . B5 . A5 . F#5 . E5 . D5 . E5 .',
      'D5+ . F#5+ . A5+ . D6+ . E6+ . F#6+ . A6+ - - -',
      'F#6+~ - - - E6+ . D6+ . E6+~ - - - - - - -',
    ],
    kong: [
      'D4 . . . A4 . . . D5 . . . A4 . . .',
      'B4 . . . F#4 . . . D4 . . . E4 . . .',
      'D4 . . . A4 . . . D5 . . . F#4 . . .',
      'E4 . . . B4 . . . A4 . . . E4 . . .',
      'B3 . . . F#4 . . . B4 . . . A4 . . .',
      'F#4 . . . D4 . . . A3 . . . E4 . . .',
      'D4 . . . F#4 . . . A4 . . . D5 . . .',
      'F#4 . . . E4 . . . A4 . . . E4 . . .',
    ],
    tro: [
      ...repeat([REST_BAR], 4),
      'D5 - - - - - - - E5 - - - F#5 - - -',
      'A5 - - - - - - - F#5 - - - E5 - - -',
      'D5 - - - F#5 - - - A5 - - - B5 - - -',
      'A5 - - - - - - - - - - - . . . .',
    ],
    bass: [
      'D2 . . D2 . . A2 . D2 . . D2 . . A2 .',
      'B2 . . B2 . . F#2 . D2 . . D2 . . E2 .',
      'D2 . . D2 . . A2 . D2 . . D2 . . A2 .',
      'E2 . . E2 . . B2 . A2 . . A2 . . E2 .',
      'B2 . . B2 . . F#2 . B2 . . B2 . . A2 .',
      'F#2 . . F#2 . . D2 . A2 . . A2 . . E2 .',
      'D2 . . D2 . . A2 . D2 . . D2 . . A2 .',
      'F#2 . . F#2 . . E2 . A2 . . A2 . . E2 .',
    ],
    skor: [...repeat(['T . . S . . T . T . S . . . S .'], 7), 'T . S . T . S . T S T S T T S S'],
    chhing: repeat(['x . o . x . o . x . o . x . o .'], 8),
  },
};
