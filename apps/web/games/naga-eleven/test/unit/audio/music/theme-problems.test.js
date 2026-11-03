import { describe, expect, it } from 'vitest';
import { themeProblems } from '../../../../src/audio/music/theme-problems.js';

const GOOD = {
  id: 'good',
  bpm: 100,
  loop: true,
  level: 1,
  scale: ['C', 'D', 'E', 'G', 'A'],
  bars: 1,
  tracks: {
    roneat: ['C5 - . E5+~ . . G5 . A5 . C6 . . . D6 .'],
    skor: ['T . S . . . . . t . . . . . . .'],
  },
};

const withTrack = (name, bars) => ({ ...GOOD, tracks: { [name]: bars } });

describe('theme problems', () => {
  it('finds none in a theme that plays as written', () => {
    expect(themeProblems(GOOD)).toEqual([]);
  });

  it('counts the steps of every bar and the bars of every track', () => {
    expect(themeProblems(withTrack('roneat', ['C5 . . .']))).toEqual([
      'good roneat bar 1: 4 steps, not 16',
    ]);
    expect(themeProblems({ ...GOOD, bars: 2 })[0]).toBe('good roneat: 1 bars, not 2');
  });

  it('keeps notes in their instrument range and in the scale', () => {
    const problems = themeProblems(withTrack('roneat', ['C2 . F5 . . . . . . . . . . . . .']));

    expect(problems).toEqual([
      'good roneat bar 1: C2 is out of range',
      'good roneat bar 1: F5 is not in the scale',
    ]);
  });

  it('refuses a hold with nothing to hold, a hit a drum lacks and a note it cannot read', () => {
    expect(themeProblems(withTrack('roneat', ['- . . . . . . . . . . . . . . .']))).toEqual([
      'good roneat: step 1 holds nothing',
    ]);
    expect(themeProblems(withTrack('skor', ['X - . . . . . . . . . . . . . .']))).toEqual([
      'good skor bar 1: no hit X',
      'good skor bar 1: a drum cannot hold',
    ]);
    expect(themeProblems(withTrack('roneat', ['C5! . . . . . . . . . . . . . . .']))).toEqual([
      'good roneat bar 1: no note C5!',
    ]);
  });

  it('wants a pentatonic scale, a tempo and an instrument it knows', () => {
    expect(themeProblems({ ...GOOD, scale: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] })).toContain(
      'good: its scale is not pentatonic',
    );
    expect(themeProblems({ ...GOOD, bpm: 0 })).toContain('good: needs a tempo and bars');
    expect(themeProblems(withTrack('banjo', []))).toEqual(['good banjo: no such instrument']);
  });
});
