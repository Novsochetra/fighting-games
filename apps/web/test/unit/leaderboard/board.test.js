import { describe, expect, it, vi } from 'vitest';
import { boardRoute, pickedGame } from '../../../src/leaderboard/board-route.js';
import { formatClock, formatDay, formatScore } from '../../../src/leaderboard/format.js';
import { boardPath, fetchBoard } from '../../../src/leaderboard/leaderboard-client.js';
import { readBoard } from '../../../src/leaderboard/read-board.js';
import { boardView, runsOf } from '../../../src/leaderboard/view-model.js';
import { run, sampleBoard } from '../../support/leaderboard-harness.js';

const BOARD = {
  heroes: { bokator: 'Bokator', angkor: 'Angkor Warrior', moss: 'Moss Shade' },
  difficulties: ['Easy', 'Normal', 'Hard'],
};

describe('readBoard', () => {
  it('keeps every run made of what a run is', () => {
    const board = readBoard(sampleBoard());
    expect(board.weekStart).toBe('2026-10-26');
    expect(board.week.map((entry) => entry.name)).toEqual(['Sok Dara', 'សុខ ដារ៉ា', 'Mey', 'Arun']);
    expect(board.allTime).toHaveLength(2);
  });

  it.each([
    ['no name', { name: '' }],
    ['a name with a line break', { name: 'Sok\nDara' }],
    ['a score as text', { score: '9000' }],
    ['no score', { score: 0 }],
    ['part of a mission', { mission: 1.5 }],
    ['a date with markup', { date: '<b>' }],
  ])('drops a run with %s', (_label, extra) => {
    expect(readBoard({ week: [run('Sok', 10, extra)], allTime: [] }).week).toEqual([]);
  });

  it('reads anything else as empty boards', () => {
    expect(readBoard(null)).toEqual({ weekStart: '', week: [], allTime: [] });
    expect(readBoard({ week: 'all', allTime: [null] })).toEqual({
      weekStart: '',
      week: [],
      allTime: [],
    });
  });
});

describe('boardView', () => {
  it('gives each run its place, medal, hero, score, how far it got, time and day', () => {
    const view = boardView(readBoard(sampleBoard()).week, { board: BOARD, locale: 'en-US' });
    expect(view.isEmpty).toBe(false);
    expect(view.podium.map((row) => row.medal)).toEqual(['gold', 'silver', 'bronze']);
    expect(view.rows[0]).toMatchObject({
      place: 1,
      name: 'Sok Dara',
      heroName: 'Angkor Warrior',
      scoreLabel: '48,210',
      reachedLabel: 'All clear',
      difficultyName: 'Hard',
      timeLabel: '12:34',
      dateLabel: 'Oct 28',
    });
    expect(view.rows[3]).toMatchObject({ place: 4, medal: '', heroName: '', timeLabel: '1:02:05' });
  });

  it('is empty with no runs, and picks the week or every run', () => {
    expect(boardView([], { board: BOARD, locale: 'en-US' })).toEqual({
      isEmpty: true,
      podium: [],
      rows: [],
    });
    const data = readBoard(sampleBoard());
    expect(runsOf(data, 'week')).toBe(data.week);
    expect(runsOf(data, 'all')).toBe(data.allTime);
  });
});

describe('formatting a run', () => {
  it('writes the score, the clock and the day', () => {
    expect(formatScore(1234567, 'en-US')).toBe('1,234,567');
    expect(formatClock(59)).toBe('0:59');
    expect(formatClock(3600)).toBe('1:00:00');
    expect(formatDay('2026-11-02', 'en-US')).toBe('Nov 2');
  });
});

describe('fetchBoard', () => {
  it("asks for a game's board by its id, and reads what comes", async () => {
    const fetchFn = vi.fn(async () => ({ ok: true, json: async () => sampleBoard() }));
    const board = await fetchBoard(fetchFn, boardPath('steel-and-dust'));
    expect(fetchFn.mock.calls[0][0]).toBe('api/leaderboard?game=steel-and-dust');
    expect(board.week).toHaveLength(4);
  });

  it('fails on an answer that is not one', async () => {
    const fetchFn = vi.fn(async () => ({ ok: false, status: 503, json: async () => ({}) }));
    await expect(fetchBoard(fetchFn, 'api/leaderboard?game=x')).rejects.toThrow(/503/);
  });
});

describe("a game's board address", () => {
  it('names the game, or none', () => {
    expect(boardRoute('steel-and-dust')).toBe('/leaderboard/?game=steel-and-dust');
    expect(boardRoute(null)).toBe('/leaderboard/');
  });

  it('picks the game asked for, or else the first with a board', () => {
    const games = [{ id: 'a' }, { id: 'b' }];
    expect(pickedGame(games, 'b')).toBe(games[1]);
    expect(pickedGame(games, 'zzz')).toBe(games[0]);
    expect(pickedGame([], 'a')).toBeNull();
  });
});
