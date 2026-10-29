import { describe, expect, it } from 'vitest';
import { readInitials, stepLetter, typedLetter } from '../../../src/online/initials.js';
import { readBoard } from '../../../src/online/read-board.js';
import { rankText, scoreBody } from '../../../src/online/score-body.js';

const onlineRun = (extra) => ({
  initials: 'SOK',
  score: 9000,
  mission: 4,
  hero: 'bokator',
  difficulty: 2,
  seconds: 754,
  cleared: false,
  date: '2026-10-28',
  ...extra,
});

describe('readBoard', () => {
  it('keeps each board, with the time in the game’s ticks as the device board keeps it', () => {
    const board = readBoard({ week: [onlineRun()], allTime: [onlineRun({ cleared: true })] });
    expect(board.week).toEqual([
      {
        initials: 'SOK',
        score: 9000,
        mission: 4,
        hero: 'bokator',
        difficulty: 2,
        time: 754 * 60,
        cleared: false,
        date: '2026-10-28',
      },
    ]);
    expect(board.allTime[0].cleared).toBe(true);
  });

  it.each([
    ['markup for initials', { initials: '<img src=x onerror=alert(1)>' }],
    ['lowercase initials', { initials: 'sok' }],
    ['a hero the game lacks', { hero: '<b>ninja</b>' }],
    ['a mission past the last', { mission: 13 }],
    ['a difficulty the game lacks', { difficulty: 3 }],
    ['a score as text', { score: '9000' }],
    ['no score', { score: 0 }],
    ['time as text', { seconds: '1' }],
    ['a date with markup', { date: '<script>' }],
  ])('drops a run with %s, as it is written into the page', (_label, extra) => {
    expect(readBoard({ week: [onlineRun(extra)], allTime: [] }).week).toEqual([]);
  });

  it('reads anything else as empty boards', () => {
    expect(readBoard(null)).toEqual({ week: [], allTime: [] });
    expect(readBoard({ week: 'lots', allTime: [null] })).toEqual({ week: [], allTime: [] });
  });
});

describe('initials', () => {
  it('starts as AAA, or the letters last posted', () => {
    expect(readInitials(null)).toEqual(['A', 'A', 'A']);
    expect(readInitials('DAR')).toEqual(['D', 'A', 'R']);
    expect(readInitials('da')).toEqual(['A', 'A', 'A']);
    expect(readInitials(['D', 'A', 'R'])).toEqual(['A', 'A', 'A']);
  });

  it('turns a letter round the alphabet both ways', () => {
    expect(stepLetter('A', 1)).toBe('B');
    expect(stepLetter('Z', 1)).toBe('A');
    expect(stepLetter('A', -1)).toBe('Z');
  });

  it('reads a typed letter from its key, and nothing else', () => {
    expect(typedLetter('KeyQ')).toBe('Q');
    expect(typedLetter('Digit1')).toBeNull();
    expect(typedLetter('ArrowUp')).toBeNull();
  });
});

describe('scoreBody', () => {
  it('sends the run with its time in whole seconds, its initials and its ticket', () => {
    const run = {
      score: 4200,
      mission: 3,
      hero: 'moss',
      difficulty: 0,
      time: 3659,
      cleared: false,
    };
    expect(scoreBody({ ...run, at: 1 }, ['S', 'O', 'K'], 'ticket')).toEqual({
      initials: 'SOK',
      score: 4200,
      mission: 3,
      hero: 'moss',
      difficulty: 0,
      seconds: 60,
      cleared: false,
      ticket: 'ticket',
    });
  });

  it('names both places a run took', () => {
    expect(rankText({ week: 3, allTime: 18 })).toBe('#3 this week · #18 all time');
  });
});
