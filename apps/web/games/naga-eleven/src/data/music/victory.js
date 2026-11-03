// a won match: a run up to a rolled high C, played once
export const VICTORY = {
  id: 'victory',
  bpm: 132,
  loop: false,
  level: 1,
  scale: ['C', 'D', 'E', 'G', 'A'],
  bars: 2,
  tracks: {
    roneat: [
      'C5+ . E5+ . G5+ . C6+ . E6+ . D6+ . E6+ . G6+ .',
      'C6+~ - - - - - - - - - - - . . . .',
    ],
    kong: ['C4 . . . G4 . . . C5 . . . G4 . . .', 'C4 . . . . . . . . . . . . . . .'],
    bass: ['C2 . . . G2 . . . C3 . . . G2 . . .', 'C2 - - - - - - - . . . . . . . .'],
    skor: ['T . S . T . S . T S T S T T T T', 'T . . . . . . . . . . . . . . .'],
    chhing: ['x . o . x . o . x . o . x . o .', 'o . . . . . . . . . . . . . . .'],
  },
};
