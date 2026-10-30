// @vitest-environment happy-dom
import { fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  boardFetch,
  byId,
  openLeaderboard,
  run,
  sampleBoard,
  SECOND_GAME,
  stopLeaderboard,
  texts,
} from '../../../support/leaderboard-harness.js';
import { waitUntil } from '../../../support/render-arcade.tsx';

const templeBoard = { ...sampleBoard(), week: [run('Vanna', 77000, { hero: 'moss' })] };
const twoGames = () => boardFetch({ second: true, boards: { [SECOND_GAME.id]: templeBoard } });

const chips = () => [...document.querySelectorAll('#board-games .game-picker__game')];
const picked = () => chips().find((chip) => chip.getAttribute('aria-pressed') === 'true');
const podium = () => texts('.board-place__name');
const boardShows = (name) => waitUntil(() => expect(podium()[0]).toBe(name));

afterEach(stopLeaderboard);

describe('a leaderboard for each game', () => {
  it('shows one game at a time, picked from a row of the games with a board', async () => {
    const { fetchFn, asked } = twoGames();
    await openLeaderboard(fetchFn);
    await boardShows('Sok Dara');
    expect(chips().map((chip) => chip.textContent)).toEqual(['Steel & Dust', 'Temple Run']);
    expect(picked().dataset.game).toBe('steel-and-dust');
    expect(document.querySelectorAll('.game-board')).toHaveLength(1);
    expect(asked).not.toContain(`/api/leaderboard?game=${SECOND_GAME.id}`);

    fireEvent.click(chips()[1]);
    await boardShows('Vanna');
    expect(picked().dataset.game).toBe(SECOND_GAME.id);
    expect(texts('.game-board__title')).toEqual(['Temple Run']);
    expect(window.location.search).toBe(`?game=${SECOND_GAME.id}`);
  });

  it("opens on the game its address names, so a game's board can be shared", async () => {
    const { fetchFn } = twoGames();
    await openLeaderboard(fetchFn, { path: `/leaderboard/?game=${SECOND_GAME.id}` });
    await boardShows('Vanna');
    expect(picked().dataset.game).toBe(SECOND_GAME.id);
  });

  it('opens on the first game when the address names none with a board', async () => {
    const { fetchFn } = twoGames();
    await openLeaderboard(fetchFn, { path: '/leaderboard/?game=morodok-angkor' });
    await boardShows('Sok Dara');
    expect(picked().dataset.game).toBe('steel-and-dust');
  });

  it('keeps the period as the game changes', async () => {
    const { fetchFn } = twoGames();
    await openLeaderboard(fetchFn);
    await boardShows('Sok Dara');
    fireEvent.click(document.querySelector('#board-period [data-value="all"]'));
    expect(podium()).toEqual(['Bopha', 'Sok Dara']);
    fireEvent.click(chips()[1]);
    await waitUntil(() => expect(texts('.game-board__title')).toEqual(['Temple Run']));
    expect(byId('board-period').dataset.segment).toBe('1');
  });

  it('shows no row to pick from while only one game has a board', async () => {
    const { fetchFn } = boardFetch();
    await openLeaderboard(fetchFn);
    await boardShows('Sok Dara');
    expect(byId('board-games')).toBeNull();
  });
});
