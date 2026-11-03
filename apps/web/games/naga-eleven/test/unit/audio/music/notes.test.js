import { describe, expect, it } from 'vitest';
import { midiToFrequency, parseNote, pitchClassOf } from '../../../../src/audio/music/notes.js';

describe('notes', () => {
  it('reads a note with its sharp or flat, its octave and its marks', () => {
    expect(parseNote('A4')).toEqual({ midi: 69, pitchClass: 9, octave: false, roll: false });
    expect(parseNote('F#5+~')).toEqual({ midi: 78, pitchClass: 6, octave: true, roll: true });
    expect(parseNote('Bb3')).toMatchObject({ midi: 58, pitchClass: 10 });
    expect(parseNote('C4~')).toMatchObject({ midi: 60, roll: true, octave: false });
  });

  it('reads nothing that is no note', () => {
    for (const token of ['H4', 'A', '4A', 'A4!', '-', '.']) {
      expect(parseNote(token)).toBe(null);
    }
  });

  it('names pitch classes round the octave', () => {
    expect(['C', 'D', 'E', 'F#', 'Bb', 'B'].map(pitchClassOf)).toEqual([0, 2, 4, 6, 10, 11]);
    expect(pitchClassOf('Cb')).toBe(11);
  });

  it('tunes A4 to 440 Hz, an octave doubling it', () => {
    expect(midiToFrequency(69)).toBe(440);
    expect(midiToFrequency(81)).toBe(880);
  });
});
