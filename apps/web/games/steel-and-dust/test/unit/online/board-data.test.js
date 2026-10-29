import { describe, expect, it } from 'vitest';
import { cleanName, nameProblem, readStoredName } from '../../../src/online/player-name.js';
import { readBoard } from '../../../src/online/read-board.js';
import { rankText, scoreBody } from '../../../src/online/score-body.js';

const onlineRun = (extra) => ({
  name: 'Sok Dara',
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
        name: 'Sok Dara',
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
    ['no name', { name: '' }],
    ['a name as a number', { name: 42 }],
    ['a control character in the name', { name: 'Sok\u0007' }],
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

describe('a player name', () => {
  it('is cleaned of extra spaces, and kept from storage only as text', () => {
    expect(cleanName('  Sok   Dara ')).toBe('Sok Dara');
    expect(readStoredName('Dara')).toBe('Dara');
    expect(readStoredName({ evil: true })).toBe('');
  });

  it.each(['Sok Dara', 'សុខ ដារ៉ា', "O'Neil", 'Jean-Luc'])('takes %j', (name) => {
    expect(nameProblem(name)).toBeNull();
  });

  it.each([
    ['nothing', '', /Type your name/],
    ['a name too long', 'ក'.repeat(21), /at most 20/],
    ['markup', '<b>Sok</b>', /letters, numbers/],
  ])('says so for %s before sending it', (_label, name, problem) => {
    expect(nameProblem(name)).toMatch(problem);
  });
});

describe('scoreBody', () => {
  it('sends the run with its time in whole seconds, its name and its ticket', () => {
    const run = {
      score: 4200,
      mission: 3,
      hero: 'moss',
      difficulty: 0,
      time: 3659,
      cleared: false,
    };
    expect(scoreBody({ ...run, at: 1 }, 'Sok Dara', 'ticket')).toEqual({
      name: 'Sok Dara',
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
