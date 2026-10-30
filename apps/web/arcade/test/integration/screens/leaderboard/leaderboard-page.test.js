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

  it('writes a name a player typed as text, never as markup', async () => {
    const board = { ...sampleBoard(), week: [run('<img src=x onerror=alert(1)>', 10)] };
    const { fetchFn } = boardFetch({ board });
    await openLeaderboard(fetchFn);
    await showsBoard();
    expect(document.querySelector('.board-podium img')).toBeNull();
    expect(texts('.board-podium__name')).toEqual(['<img src=x onerror=alert(1)>']);
  });
});
