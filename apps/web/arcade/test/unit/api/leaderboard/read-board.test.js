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

  const poster = (url = 'https://files.example.test/p') => ({
    avatar: `${url}-192.jpg`,
    images: [640, 1200].map((width) => ({ width, url: `${url}-${width}.jpg` })),
  });

  it("keeps a run's avatar and poster, each an https address", () => {
    const [read] = readBoard({ week: [run('Sok', 10, { poster: poster() })], allTime: [] }).week;
    expect(read.poster).toEqual(poster());
    expect(readBoard(sampleBoard()).week[0].poster).toBeNull();
  });

  it.each([
    ['an http address', poster('http://files.example.test/p')],
    ['a script address', poster('javascript:alert(1)//')],
    ['a comma that would split the srcset', poster('https://files.example.test/a,b')],
    ['no avatar', { ...poster(), avatar: undefined }],
    [
      'a size with no width',
      { ...poster(), images: [{ url: 'https://files.example.test/p.jpg' }] },
    ],
    ['no sizes', { ...poster(), images: [] }],
    ['text', 'https://files.example.test/p.jpg'],
  ])('keeps the run but not a poster with %s', (_label, sent) => {
    const [read] = readBoard({ week: [run('Sok', 10, { poster: sent })], allTime: [] }).week;
    expect(read).toMatchObject({ name: 'Sok', poster: null });
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
