import { expect } from 'vitest';
import { realCatalogJson } from './home-harness.js';
import { renderArcade, unmountArcade, waitUntil } from './render-arcade.tsx';

export const run = (name, score, extra) => ({
  name,
  score,
  mission: 4,
  hero: 'bokator',
  difficulty: 1,
  seconds: 754,
  cleared: false,
  date: '2026-10-28',
  ...extra,
});

export const sampleBoard = () => ({
  weekStart: '2026-10-26',
  week: [
    run('Sok Dara', 48210, { hero: 'angkor', cleared: true, mission: 12, difficulty: 2 }),
    run('សុខ ដារ៉ា', 23900),
    run('Mey', 9000, { hero: 'moss' }),
    run('Arun', 4200, { hero: 'ember', mission: 2, seconds: 3725 }),
  ],
  allTime: [run('Bopha', 99000), run('Sok Dara', 48210)],
});

const reply = (body, status = 200) => ({ ok: status === 200, status, json: async () => body });

// a second game with a board, as Steel & Dust's copy, for the tests that pick between games
export const SECOND_GAME = { id: 'temple-run', title: 'Temple Run' };

async function catalogOf({ only, second }) {
  const { games } = JSON.parse(await realCatalogJson());
  const steel = games.find((game) => game.id === 'steel-and-dust');
  const copy = { ...steel, ...SECOND_GAME, path: `games/${SECOND_GAME.id}/` };
  const shown = only ? games.filter((game) => game.id === only) : games;

  return { games: second ? [...shown, copy] : shown };
}

// Stands in for the server: the real catalog (or one game of it, or with a second board game), and
// each game's board as the test sets it, by its id.
export function boardFetch({ board = sampleBoard(), boards = {}, status = 200, ...catalog } = {}) {
  const asked = [];
  const fetchFn = async (url) => {
    const target = new URL(url, window.location.href);

    asked.push(`${target.pathname}${target.search}`);

    if (target.pathname === '/api/games') {
      return reply(await catalogOf(catalog));
    }

    const game = target.searchParams.get('game');

    return target.pathname === '/api/leaderboard'
      ? reply(boards[game] ?? board, status)
      : reply({}, 404);
  };

  return { fetchFn, asked };
}

export const byId = (id) => document.getElementById(id);

export const texts = (selector) =>
  [...document.querySelectorAll(selector)].map((element) => element.textContent.trim());

// Opens the arcade on the leaderboard and waits for a game's board, or its notice, to show.
export async function openLeaderboard(fetchFn, { path = '/leaderboard/', ...options } = {}) {
  const page = renderArcade({ path, fetch: fetchFn, ...options });

  await waitUntil(() => expect(document.querySelector('.game-board__title')).not.toBeNull());

  return page;
}

export const stopLeaderboard = () => unmountArcade();
