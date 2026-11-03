import { REST_BAR, repeat } from './bars.js';

// under the crowd in play: a pulse and light drums, a few roneat notes now and then
export const MATCH = {
  id: 'match',
  bpm: 126,
  loop: true,
  level: 0.65,
  scale: ['D', 'F', 'G', 'A', 'C'],
  bars: 4,
  tracks: {
    bass: [
      'D2 . D2 . D2 . D2 . F2 . F2 . G2 . G2 .',
      'A2 . A2 . A2 . A2 . G2 . G2 . F2 . F2 .',
      'D2 . D2 . D2 . D2 . F2 . F2 . G2 . G2 .',
      'C3 . C3 . A2 . A2 . G2 . G2 . A2 . A2 .',
    ],
    roneat: [
      REST_BAR,
      '. . . . . . . . D5 . F5 . G5 . A5 .',
      REST_BAR,
      '. . . . . . . . C6 . A5 . G5 . F5 .',
    ],
    skor: repeat(['T . . . S . . t T . . . S . t .'], 4),
    chhing: repeat(['x . o . x . o . x . o . x . o .'], 4),
  },
};
