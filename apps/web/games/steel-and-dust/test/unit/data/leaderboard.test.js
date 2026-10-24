import { describe, expect, it } from 'vitest';
import {
  LEADERBOARD_SIZE,
  rankOf,
  rankRun,
  sanitizeLeaderboard,
} from '../../../src/data/leaderboard.js';

const entry = (score, more = {}) => ({
  score,
  mission: 3,
  hero: 'moss',
  difficulty: 1,
  time: 5400,
  cleared: false,
  at: 1792800000000,
  ...more,
});
const scores = (board) => board.map((run) => run.score);

describe('the leaderboard', () => {
  it('keeps the runs best first', () => {
    const board = [900, 4000, 2500].reduce((ranked, score) => rankRun(ranked, entry(score)), []);
    expect(scores(board)).toEqual([4000, 2500, 900]);
  });

  it('ranks a run that ties a score under the run that got there first', () => {
    const first = entry(2500, { hero: 'blue' });
    const second = entry(2500, { hero: 'ember' });
    const board = rankRun(rankRun([entry(4000)], first), second);
    expect(board.map((run) => run.hero)).toEqual(['moss', 'blue', 'ember']);
  });

  it(`holds the best ${LEADERBOARD_SIZE} runs`, () => {
    let board = [];
    for (let i = 1; i <= LEADERBOARD_SIZE; i++) {
      board = rankRun(board, entry(i * 100));
    }
    const low = entry(50);
    expect(rankRun(board, low)).toHaveLength(LEADERBOARD_SIZE);
    expect(rankRun(board, low)).not.toContain(low);
    const high = entry(5000);
    expect(scores(rankRun(board, high))).toEqual([
      5000, 1000, 900, 800, 700, 600, 500, 400, 300, 200,
    ]);
  });

  it('gives the place of a run on the board, or none', () => {
    const run = entry(2500);
    const board = rankRun([entry(4000), entry(900)], run);
    expect(rankOf(board, run)).toBe(2);
    expect(rankOf(board, entry(2500))).toBe(0);
    expect(rankOf(board, null)).toBe(0);
  });

  it('loads a saved board best first, without the runs it cannot show', () => {
    const stored = [
      entry(900),
      entry(4000, { cleared: true, mission: 12 }),
      entry(0),
      entry(300, { mission: 13 }),
      entry(300, { difficulty: 3 }),
      entry(300, { hero: 7 }),
      entry(300, { at: 'today' }),
      null,
      entry(2500, { extra: 'kept out' }),
    ];
    const board = sanitizeLeaderboard(stored);
    expect(scores(board)).toEqual([4000, 2500, 900]);
    expect(board[0]).toMatchObject({ cleared: true, mission: 12 });
    expect(board[1]).toEqual(entry(2500));
  });

  it('loads anything that is not a list as an empty board', () => {
    expect(sanitizeLeaderboard(null)).toEqual([]);
    expect(sanitizeLeaderboard({ score: 900 })).toEqual([]);
  });
});
