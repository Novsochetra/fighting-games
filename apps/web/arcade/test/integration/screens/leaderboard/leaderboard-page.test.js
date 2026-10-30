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
    expect(texts('.board-podium__name')).toEqual(['Sok Dara', 'សុខ ដារ៉ា', 'Mey']);
    expect(texts('.board-podium__score')).toEqual(['48,210', '23,900', '9,000']);
    expect(texts('.board-podium__detail').slice(0, 2)).toEqual(['Angkor Warrior', 'All clear']);
    expect(texts('.board-list__name')).toEqual(['Arun']);
    expect(texts('.board-list__detail')).toEqual(['Ember Shade · Mission 2 · Normal']);
    expect(asked).toContain('/api/leaderboard?game=steel-and-dust');
  });

  it('shows every run with All time', async () => {
    const { fetchFn } = boardFetch();
    await openLeaderboard(fetchFn);
    await showsBoard();
    fireEvent.click(document.querySelector('#board-period [data-value="all"]'));
    expect(texts('.board-podium__name')).toEqual(['Bopha', 'Sok Dara']);
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

  it("shows a run's poster small, the smallest size sharp there, and opens it whole", async () => {
    const posterOf = (id) =>
      [320, 640, 1200].map((width) => ({
        width,
        url: `https://files.example.test/${id}-${width}`,
      }));
    const week = [
      run('Sok Dara', 48210, { poster: posterOf('sok') }),
      run('Mey', 9000),
      run('Arun', 4200),
      run('Bopha', 100, { poster: posterOf('bopha') }),
    ];
    const { fetchFn } = boardFetch({ board: { ...sampleBoard(), week } });
    await openLeaderboard(fetchFn);
    await showsBoard();
    const buttons = [...document.querySelectorAll('.board-poster')];
    expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual([
      "View Sok Dara's poster",
      "View Bopha's poster",
    ]);
    const [podium, row] = buttons.map((button) => button.querySelector('img'));
    expect(podium.getAttribute('srcset')).toBe(
      'https://files.example.test/sok-320 320w, https://files.example.test/sok-640 640w, https://files.example.test/sok-1200 1200w',
    );
    expect(podium.getAttribute('sizes')).toBe('(min-width: 50rem) 14rem, 30vw');
    expect(row.getAttribute('sizes')).toBe('4.5rem');
    expect(row.getAttribute('loading')).toBe('lazy');
    expect(byId('poster-sheet').open).toBe(false);
    fireEvent.click(buttons[1]);
    expect(byId('poster-sheet').open).toBe(true);
    expect(byId('poster-title').textContent).toBe('Bopha');
    expect(byId('poster-description').textContent).toBe('#4 · 100 points · Mission 4 · Oct 28');
    const whole = byId('poster-image');
    expect(whole.getAttribute('src')).toBe('https://files.example.test/bopha-320');
    expect(whole.getAttribute('sizes')).toBe('(max-width: 40rem) 100vw, 36rem');
    expect(whole.getAttribute('srcset')).toMatch(/bopha-1200 1200w$/);
  });

  it('writes a name a player typed as text, never as markup', async () => {
    const board = { ...sampleBoard(), week: [run('<img src=x onerror=alert(1)>', 10)] };
    const { fetchFn } = boardFetch({ board });
    await openLeaderboard(fetchFn);
    await showsBoard();
    expect(document.querySelector('.board-podium img[src="x"]')).toBeNull();
    expect(texts('.board-podium__name')).toEqual(['<img src=x onerror=alert(1)>']);
  });
});
