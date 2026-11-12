const CONCERT_A = 440;
const A_IN_OCTAVE = 9;
const A_OCTAVE = 4;
const FROM_C = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

// every pitch counts semitones from the A above middle C
export const hertz = (semitonesFromA) => CONCERT_A * 2 ** (semitonesFromA / 12);

function semitonesOf(name) {
  const octave = Number(name.slice(-1));

  return (octave - A_OCTAVE) * 12 + FROM_C[name[0]] - A_IN_OCTAVE;
}

// 'E5 . G5' is two notes around a rest
export const parseBars = (bars) =>
  bars
    .join(' ')
    .split(/\s+/)
    .map((name) => (name === '.' ? null : semitonesOf(name)));

export function streakTranspose(streak, scale) {
  return scale[(Math.max(1, streak) - 1) % scale.length];
}

export const stepSeconds = ({ beatsPerMinute, stepsPerBeat }, rate = 1) =>
  60 / (beatsPerMinute * rate) / stepsPerBeat;
