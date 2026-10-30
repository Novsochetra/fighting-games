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

  it("offers a run's poster at its smallest and in every size, and its hero as its avatar", () => {
    const images = [1200, 640].map((width) => ({ width, url: `https://f.test/p-${width}` }));
    const poster = { avatar: 'https://f.test/p-192', images };
    const runs = [{ ...readBoard(sampleBoard()).week[0], poster }];
    const [row] = boardView(runs, { board: BOARD, locale: 'en-US' }).rows;
    expect(row.poster).toEqual({
      previewSrc: 'https://f.test/p-640',
      srcSet: 'https://f.test/p-640 640w, https://f.test/p-1200 1200w',
    });
    expect(row.avatarSrc).toBe('https://f.test/p-192');
  });

  it("gives a run without a poster the player's initials, colored by the name, instead", () => {
    const [khmer, plain] = boardView(readBoard(sampleBoard()).week.slice(0, 2).reverse(), {
      board: BOARD,
      locale: 'en-US',
    }).rows;
    expect(plain).toMatchObject({ poster: null, avatarSrc: null, initials: 'SD' });
    expect(khmer.initials).toBe('សុដា');
    expect(plain.palette).toBeGreaterThan(0);
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
