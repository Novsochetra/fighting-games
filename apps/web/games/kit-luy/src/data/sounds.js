// Each sound is a few voices. A note counts semitones from the A above middle C; `at` and
// `length` are seconds.
export const SOUNDS = {
  tap: [{ wave: 'square', note: 12, at: 0, length: 0.04, volume: 0.1 }],
  right: [
    { wave: 'square', note: 14, at: 0, length: 0.07, volume: 0.16 },
    { wave: 'square', note: 19, at: 0.07, length: 0.24, volume: 0.16 },
    { wave: 'triangle', note: 7, at: 0, length: 0.16, volume: 0.2 },
  ],
  fast: [{ wave: 'square', note: 31, at: 0.12, length: 0.12, volume: 0.08 }],
  combo: [
    { wave: 'square', note: 12, at: 0, length: 0.07, volume: 0.14 },
    { wave: 'square', note: 16, at: 0.06, length: 0.07, volume: 0.14 },
    { wave: 'square', note: 19, at: 0.12, length: 0.07, volume: 0.14 },
    { wave: 'square', note: 24, at: 0.18, length: 0.2, volume: 0.14 },
  ],
  wrong: [
    { wave: 'sawtooth', note: -19, slideTo: -31, at: 0, length: 0.3, volume: 0.22 },
    { wave: 'square', note: -26, slideTo: -33, at: 0.02, length: 0.26, volume: 0.14 },
  ],
  tick: [{ wave: 'square', note: 15, at: 0, length: 0.05, volume: 0.12 }],
  beat: [{ wave: 'square', note: 3, at: 0, length: 0.12, volume: 0.16 }],
  go: [
    { wave: 'square', note: 15, at: 0, length: 0.3, volume: 0.16 },
    { wave: 'triangle', note: 3, at: 0, length: 0.3, volume: 0.2 },
  ],
  levelUp: [
    { wave: 'square', note: 3, at: 0, length: 0.09, volume: 0.14 },
    { wave: 'square', note: 7, at: 0.08, length: 0.09, volume: 0.14 },
    { wave: 'square', note: 10, at: 0.16, length: 0.09, volume: 0.14 },
    { wave: 'square', note: 15, at: 0.24, length: 0.3, volume: 0.14 },
    { wave: 'triangle', note: -9, at: 0, length: 0.5, volume: 0.2 },
  ],
  over: [
    { wave: 'square', note: 7, at: 0, length: 0.18, volume: 0.15 },
    { wave: 'square', note: 3, at: 0.18, length: 0.18, volume: 0.15 },
    { wave: 'square', note: 0, at: 0.36, length: 0.18, volume: 0.15 },
    { wave: 'square', note: -5, at: 0.54, length: 0.5, volume: 0.15 },
  ],
  best: [
    { wave: 'square', note: 3, at: 0, length: 0.1, volume: 0.15 },
    { wave: 'square', note: 3, at: 0.12, length: 0.1, volume: 0.15 },
    { wave: 'square', note: 3, at: 0.24, length: 0.1, volume: 0.15 },
    { wave: 'square', note: 7, at: 0.36, length: 0.16, volume: 0.15 },
    { wave: 'square', note: 10, at: 0.52, length: 0.16, volume: 0.15 },
    { wave: 'square', note: 15, at: 0.68, length: 0.6, volume: 0.15 },
    { wave: 'triangle', note: -9, at: 0.36, length: 0.9, volume: 0.22 },
  ],
};

// a run of right answers climbs a major scale, a step an answer, and starts over an octave on
export const STREAK_SCALE = [0, 2, 4, 5, 7, 9, 11, 12];
