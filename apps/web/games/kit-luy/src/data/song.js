// The run's tune: four bars of sixteenths in C pentatonic over C, A minor, F and G. A dot rests.
export const SONG = {
  beatsPerMinute: 126,
  stepsPerBeat: 4,
  tracks: [
    {
      wave: 'square',
      volume: 0.035,
      hold: 0.9,
      bars: [
        'E5 . G5 . A5 . G5 E5 D5 . E5 . C5 . . .',
        'D5 . E5 . G5 . E5 D5 C5 . A4 . C5 . . .',
        'A5 . A5 G5 E5 . G5 . A5 . C6 . A5 . . .',
        'G5 . E5 . D5 . E5 . C5 . . . . . . .',
      ],
    },
    {
      wave: 'triangle',
      volume: 0.11,
      hold: 1.6,
      bars: [
        'C3 . C3 . . . C3 . G3 . G3 . . . C3 .',
        'A2 . A2 . . . A2 . E3 . E3 . . . A2 .',
        'F2 . F2 . . . F2 . C3 . C3 . . . F2 .',
        'G2 . G2 . . . G2 . D3 . D3 . . . G2 .',
      ],
    },
  ],
};
