import { describe, expect, it } from 'vitest';
import { readBoard } from '@/api/leaderboard/read-board.js';
import { boardView, runsOf } from '@/components/board/view-model.js';
import { sampleBoard } from '../../../support/leaderboard-harness.js';

const BOARD = {
  heroes: { bokator: 'Bokator', angkor: 'Angkor Warrior', moss: 'Moss Shade' },
  difficulties: ['Easy', 'Normal', 'Hard'],
};

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

  it("offers every size of a run's poster, the smallest first, and none for a run without", () => {
    const sizes = [1200, 320, 640].map((width) => ({ width, url: `https://f.test/p-${width}` }));
    const runs = [{ ...readBoard(sampleBoard()).week[0], poster: sizes }];
    const [row] = boardView(runs, { board: BOARD, locale: 'en-US' }).rows;
    expect(row.poster).toEqual({
      src: 'https://f.test/p-320',
      srcSet: 'https://f.test/p-320 320w, https://f.test/p-640 640w, https://f.test/p-1200 1200w',
    });
    const plain = boardView(readBoard(sampleBoard()).week, { board: BOARD, locale: 'en-US' });
    expect(plain.rows[0].poster).toBeNull();
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
