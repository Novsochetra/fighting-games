export const REST = '.';
export const HOLD = '-';

const STEPS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const SHIFTS = { '': 0, '#': 1, b: -1 };
const NOTE = /^([A-G])([#b]?)(\d)([+~]*)$/;

export const tokensOf = (bar) => bar.trim().split(/\s+/);

// 'F#', 'Bb' or 'D' to 0..11
export const pitchClassOf = (name) => (STEPS[name[0]] + SHIFTS[name.slice(1)] + 12) % 12;

export const midiToFrequency = (midi) => 440 * 2 ** ((midi - 69) / 12);

// 'F#5+~' to { midi: 78, pitchClass: 6, octave: true, roll: true }, or null for what is no note
export function parseNote(token) {
  const parts = NOTE.exec(token);

  if (!parts) {
    return null;
  }

  const [, letter, shift, octave, marks] = parts;
  const pitchClass = pitchClassOf(letter + shift);

  return {
    midi: (Number(octave) + 1) * 12 + STEPS[letter] + SHIFTS[shift],
    pitchClass,
    octave: marks.includes('+'),
    roll: marks.includes('~'),
  };
}
