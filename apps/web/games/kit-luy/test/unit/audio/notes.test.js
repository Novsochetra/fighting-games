import { describe, expect, it } from 'vitest';
import { hertz, parseBars, stepSeconds, streakTranspose } from '../../../src/audio/notes.js';
import { SONG } from '../../../src/data/song.js';
import { SOUNDS, STREAK_SCALE } from '../../../src/data/sounds.js';

describe('notes', () => {
  it('tunes to concert A, an octave doubling the pitch', () => {
    expect(hertz(0)).toBe(440);
    expect(hertz(12)).toBe(880);
    expect(hertz(-12)).toBe(220);
    expect(hertz(3)).toBeCloseTo(523.25, 1);
  });

  it('reads note names, octaves and rests', () => {
    expect(parseBars(['A4 . C5', 'E5 C3 .'])).toEqual([0, null, 3, 7, -21, null]);
  });

  it('climbs the scale a step a right answer and starts over after the octave', () => {
    const steps = [1, 2, 3, 8, 9, 10].map((streak) => streakTranspose(streak, STREAK_SCALE));

    expect(steps).toEqual([0, 2, 4, 12, 0, 2]);
    expect(streakTranspose(0, STREAK_SCALE)).toBe(0);
  });

  it('times a sixteenth from the tempo, shorter when hurried', () => {
    expect(stepSeconds({ beatsPerMinute: 120, stepsPerBeat: 4 })).toBe(0.125);
    expect(stepSeconds({ beatsPerMinute: 120, stepsPerBeat: 4 }, 1.25)).toBe(0.1);
  });
});

describe('the sounds', () => {
  const voices = Object.values(SOUNDS).flat();

  it('are made of waves an oscillator has, loud enough to hear and no louder than a quarter', () => {
    for (const voice of voices) {
      expect(['square', 'triangle', 'sawtooth', 'sine']).toContain(voice.wave);
      expect(voice.volume).toBeGreaterThan(0);
      expect(voice.volume).toBeLessThanOrEqual(0.25);
    }
  });

  it('are short: none keeps an answer waiting two seconds', () => {
    for (const voice of voices) {
      expect(voice.length).toBeGreaterThan(0);
      expect(voice.at + voice.length).toBeLessThan(2);
    }
  });
});

describe('the tune', () => {
  it('fills four bars of sixteenths in every track', () => {
    for (const track of SONG.tracks) {
      expect(track.bars).toHaveLength(4);
      expect(parseBars(track.bars)).toHaveLength(64);
    }
  });

  it('is written only in notes a keyboard has', () => {
    const notes = SONG.tracks.flatMap((track) => parseBars(track.bars));

    expect(notes.every((note) => note === null || Number.isInteger(note))).toBe(true);
    expect(notes.some((note) => note !== null)).toBe(true);
  });
});
