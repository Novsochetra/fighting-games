import { describe, expect, it } from 'vitest';
import { compileTheme } from '../../../../src/audio/music/compile.js';

const THEME = {
  id: 'test',
  bpm: 120,
  loop: true,
  level: 1,
  scale: ['C', 'D', 'E', 'G', 'A'],
  bars: 1,
  tracks: {
    roneat: ['C5 - - . E5+~ . . . G5 - . . A5 . . .'],
    skor: ['T . S . . . . . t . . . . . . .'],
  },
};

describe('a theme compiled', () => {
  it('puts each note on the step it starts, a hold lengthening it', () => {
    const { steps, totalSteps, stepSeconds } = compileTheme(THEME);

    expect(totalSteps).toBe(16);
    expect(stepSeconds).toBe(0.125);
    expect(steps[0]).toContainEqual({
      instrument: 'roneat',
      midi: 72,
      octave: false,
      roll: false,
      length: 3,
    });
    expect(steps[4]).toContainEqual({
      instrument: 'roneat',
      midi: 76,
      octave: true,
      roll: true,
      length: 1,
    });
    expect(steps[8]).toContainEqual(expect.objectContaining({ midi: 79, length: 2 }));
    expect(steps[1]).toEqual([]);
  });

  it('strikes the drums on their steps', () => {
    const { steps } = compileTheme(THEME);

    expect(steps[0]).toContainEqual({ instrument: 'skor', hit: 'T', length: 1 });
    expect(steps[2]).toEqual([{ instrument: 'skor', hit: 'S', length: 1 }]);
    expect(steps[8]).toContainEqual({ instrument: 'skor', hit: 't', length: 1 });
  });

  it('compiles a theme once', () => {
    expect(compileTheme(THEME)).toBe(compileTheme(THEME));
  });
});
