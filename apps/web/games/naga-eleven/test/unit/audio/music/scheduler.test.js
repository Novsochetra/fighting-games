import { describe, expect, it } from 'vitest';
import { compileTheme } from '../../../../src/audio/music/compile.js';
import { catchUp, dueNotes, startCursor } from '../../../../src/audio/music/scheduler.js';
import { THEMES } from '../../../../src/data/music/index.js';

const BEAT_THEME = {
  id: 'beat',
  bpm: 120,
  loop: true,
  level: 1,
  scale: ['C', 'D', 'E', 'G', 'A'],
  bars: 2,
  tracks: { skor: ['T . . . T . . . T . . . T . . .', 'S . . . S . . . S . . . S . . .'] },
};

const JINGLE = { ...BEAT_THEME, id: 'jingle', loop: false };

describe('the music scheduler', () => {
  it('lands every note on its beat', () => {
    const compiled = compileTheme(BEAT_THEME);
    const notes = dueNotes(compiled, startCursor(10), 12);

    expect(notes.map((note) => note.time)).toEqual([10, 10.5, 11, 11.5]);
  });

  it('takes only what falls before the lookahead, and the rest on the next call', () => {
    const compiled = compileTheme(BEAT_THEME);
    const cursor = startCursor(0);
    const first = dueNotes(compiled, cursor, 0.3);
    const second = dueNotes(compiled, cursor, 0.6);

    expect(first.map((note) => note.time)).toEqual([0]);
    expect(second.map((note) => note.time)).toEqual([0.5]);
  });

  it('loops back to its first bar on the beat after its last', () => {
    const compiled = compileTheme(BEAT_THEME);
    const notes = dueNotes(compiled, startCursor(0), 8.1);
    const hits = notes.map((note) => `${note.time}:${note.hit}`);

    expect(hits.slice(0, 9)).toEqual([
      '0:T',
      '0.5:T',
      '1:T',
      '1.5:T',
      '2:S',
      '2.5:S',
      '3:S',
      '3.5:S',
      '4:T',
    ]);
    expect(notes.at(-1)).toMatchObject({ time: 8, hit: 'T' });
  });

  it('keeps the beat however many loops it has played', () => {
    const compiled = compileTheme(THEMES.title);
    const cursor = startCursor(0.06);
    const loop = compiled.totalSteps * compiled.stepSeconds;
    const notes = dueNotes(compiled, cursor, 0.06 + loop * 20 + 0.01);
    const lastStart = notes.filter((note) => note.instrument === 'skor').at(-1);

    expect(lastStart.time).toBeCloseTo(0.06 + loop * 20, 9);
  });

  it('plays a jingle once', () => {
    const compiled = compileTheme(JINGLE);
    const cursor = startCursor(0);

    expect(dueNotes(compiled, cursor, 100)).toHaveLength(8);
    expect(cursor.done).toBe(true);
    expect(dueNotes(compiled, cursor, 200)).toEqual([]);
  });

  it('picks up on the beat after a stall, rather than rushing every step it missed', () => {
    const compiled = compileTheme(BEAT_THEME);
    const cursor = startCursor(0);

    dueNotes(compiled, cursor, 0.3);
    catchUp(compiled, cursor, 2.6);

    expect(dueNotes(compiled, cursor, 3.2).map((note) => note.time)).toEqual([3]);
  });

  it('gives each note its length in seconds', () => {
    const compiled = compileTheme(THEMES.sad);
    const [tro] = dueNotes(compiled, startCursor(0), 0.01).filter(
      (note) => note.instrument === 'tro',
    );

    expect(tro.duration).toBeCloseTo(6 * compiled.stepSeconds, 9);
  });
});
