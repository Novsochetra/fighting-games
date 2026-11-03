import { REST_BAR, repeat } from './bars.js';

// dawn by the temple steps: a driving bass, a roneat riff and the skor pushing on
export const TRAINING = {
  id: 'training',
  bpm: 140,
  loop: true,
  level: 0.85,
  scale: ['D', 'F', 'G', 'A', 'C'],
  bars: 4,
  tracks: {
    bass: [
      'D2 . D3 . D2 . D3 . D2 . D3 . C3 . A2 .',
      'F2 . F3 . F2 . F3 . G2 . G3 . A2 . C3 .',
      'D2 . D3 . D2 . D3 . D2 . D3 . C3 . A2 .',
      'G2 . G3 . A2 . A3 . C3 . C3 . D3 . D3 .',
    ],
    roneat: [
      'D5+ . F5+ . G5+ . A5+ . G5+ . F5+ . D5+ . C5+ .',
      'F5+ . G5+ . A5+ . C6+ . D6+ . C6+ . A5+ . G5+ .',
      'D5+ . F5+ . G5+ . A5+ . G5+ . F5+ . D5+ . C5+ .',
      'A5+~ - - - G5+ . F5+ . G5+~ - - - A5+ . C6+ .',
    ],
    tro: [
      ...repeat([REST_BAR], 2),
      'D5 - - - - - - - F5 - - - - - - -',
      'G5 - - - - - - - A5 - - - - - - -',
    ],
    skor: repeat(['T . S . T T S . T . S . T T S S'], 4),
    chhing: repeat(['x . x . x . x . x . x . x . x .'], 4),
  },
};
