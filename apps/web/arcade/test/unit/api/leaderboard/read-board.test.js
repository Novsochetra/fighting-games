import { describe, expect, it } from 'vitest';
import { readBoard } from '@/api/leaderboard/read-board.js';
import { run, sampleBoard } from '../../../support/leaderboard-harness.js';

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
