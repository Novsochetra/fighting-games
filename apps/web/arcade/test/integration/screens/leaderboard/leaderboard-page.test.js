// @vitest-environment happy-dom
import { fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { BOARD_ERROR } from '@/screens/leaderboard/GameBoard.tsx';
import {
  boardFetch,
  byId,
  openLeaderboard,
  run,
  sampleBoard,
  stopLeaderboard,
  texts,
} from '../../../support/leaderboard-harness.js';
import { waitUntil } from '../../../support/render-arcade.tsx';

const showsBoard = () =>
  waitUntil(() => expect(byId('board-steel-and-dust-notice').hidden).toBe(true));

afterEach(stopLeaderboard);

describe('the leaderboard screen', () => {
  it("puts this week's top three on a podium and the rest in a list", async () => {
    const { fetchFn, asked } = boardFetch();
    await openLeaderboard(fetchFn);
    await showsBoard();
    expect(texts('#board-steel-and-dust-title')).toEqual(['Steel & Dust']);
    expect(texts('.board-place__name')).toEqual(['Sok Dara', 'សុខ ដារ៉ា', 'Mey']);
    expect(texts('.board-place__score')).toEqual(['48,210', '23,900', '9,000']);
    expect(texts('.board-place__detail')).toEqual([
      'Angkor Warrior · All clear',
      'Bokator',
      'Moss Shade',
    ]);
    expect(texts('.board-list__name')).toEqual(['Arun']);
    expect(texts('.board-list__detail')).toEqual(['Ember Shade · Mission 2']);
    expect(asked).toContain('/api/leaderboard?game=steel-and-dust');
  });

  it('shows every run with All time', async () => {
    const { fetchFn } = boardFetch();
    await openLeaderboard(fetchFn);
    await showsBoard();
    fireEvent.click(document.querySelector('#board-period [data-value="all"]'));
    expect(texts('.board-place__name')).toEqual(['Bopha', 'Sok Dara']);
    expect(document.querySelector('.board-list')).toBeNull();
  });

  it('invites a first run to an empty board, with a way to play', async () => {
    const { fetchFn } = boardFetch({ board: { weekStart: '2026-10-26', week: [], allTime: [] } });
    await openLeaderboard(fetchFn);
    await showsBoard();
    expect(texts('.board-empty__title')).toEqual(['No runs posted this week yet']);
    const play = document.querySelector('.board-empty .pill-button');
    expect(play.textContent).toBe('Play Steel & Dust');
    expect(new URL(play.href).pathname).toBe('/games/steel-and-dust/');
  });

  it('says so when the board does not load, and tries again', async () => {
    const failing = boardFetch({ status: 503 });
    await openLeaderboard(failing.fetchFn);
    await waitUntil(() =>
      expect(byId('board-steel-and-dust-status').textContent).toBe(BOARD_ERROR),
    );
    expect(byId('board-steel-and-dust-retry').hidden).toBe(false);
  });

  const posterOf = (id) => ({
    avatar: `https://files.example.test/${id}-192`,
    images: [640, 1200].map((width) => ({
      width,
      url: `https://files.example.test/${id}-${width}`,
    })),
  });

  it("puts the first place's poster across the board, and each run's hero as its avatar", async () => {
    const week = [
      run('Sok Dara', 48210, { poster: posterOf('sok') }),
      run('Mey', 9000),
      run('Arun', 4200),
      run('Bopha', 100, { poster: posterOf('bopha') }),
    ];
    const { fetchFn } = boardFetch({ board: { ...sampleBoard(), week } });
    await openLeaderboard(fetchFn);
    await showsBoard();
    const champion = document.querySelector('.board-place--champion .board-place__poster');
    expect(champion.getAttribute('src')).toBe('https://files.example.test/sok-640');
    expect(texts('.board-place--runner .avatar')).toEqual(['M', 'A']);
    expect(texts('.board-place--runner .run-avatar__place')).toEqual(['2', '3']);
    expect(texts('.board-list .run-avatar__place')).toEqual(['4']);
    const row = document.querySelector('.board-list__row .run-avatar__image');
    expect(row.getAttribute('src')).toBe('https://files.example.test/bopha-192');
    expect(row.getAttribute('loading')).toBe('lazy');
  });

  it('opens any run in a sheet: its poster whole, the smallest size sharp there, and what it did', async () => {
    const week = [run('Sok Dara', 48210), run('Mey', 9000), run('Arun', 4200)];
    week.push(run('Bopha', 100, { poster: posterOf('bopha') }));
    const { fetchFn } = boardFetch({ board: { ...sampleBoard(), week } });
    await openLeaderboard(fetchFn);
    await showsBoard();
    expect(byId('run-sheet').open).toBe(false);
    fireEvent.click(document.querySelector('.board-list__open'));
    expect(byId('run-sheet').open).toBe(true);
    expect(byId('run-title').textContent).toBe('Bopha');
    expect(byId('run-place').textContent).toBe('#4 this week · Oct 28');
    const whole = byId('run-poster');
    expect(whole.getAttribute('src')).toBe('https://files.example.test/bopha-640');
    expect(whole.getAttribute('sizes')).toBe('(max-width: 40rem) 100vw, 36rem');
    expect(whole.getAttribute('srcset')).toMatch(/bopha-1200 1200w$/);
    expect(texts('.run-facts__value')).toEqual(['100', 'Mission 4', '12:34', 'Bokator', 'Normal']);
  });

  it("shows the game's painting for a first place with no poster, and its initials in its sheet", async () => {
    const { fetchFn } = boardFetch();
    await openLeaderboard(fetchFn);
    await showsBoard();
    const art = document.querySelector('.board-place--champion .board-place__poster');
    expect(art.classList.contains('is-art')).toBe(true);
    expect(new URL(art.src).pathname).toMatch(/^\/games\/steel-and-dust\/assets\/.+\.png$/);
    fireEvent.click(document.querySelector('.board-place--champion'));
    expect(byId('run-poster')).toBeNull();
    expect(texts('#run-sheet .avatar')).toEqual(['SD']);
    expect(texts('#run-sheet .run-avatar__place')).toEqual(['1']);
  });

  it('writes a name a player typed as text, never as markup', async () => {
    const board = { ...sampleBoard(), week: [run('<img src=x onerror=alert(1)>', 10)] };
    const { fetchFn } = boardFetch({ board });
    await openLeaderboard(fetchFn);
    await showsBoard();
    expect(document.querySelector('.board-podium img[src="x"]')).toBeNull();
    expect(texts('.board-place__name')).toEqual(['<img src=x onerror=alert(1)>']);
  });
});
