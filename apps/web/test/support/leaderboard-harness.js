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

async function catalogOf(only) {
  const catalog = JSON.parse(await realCatalogJson());

  return only ? { games: catalog.games.filter((game) => game.id === only) } : catalog;
}

// Stands in for the server: the real catalog (or one game of it), and each game's board as the test
// sets it.
export function boardFetch({ board = sampleBoard(), status = 200, only } = {}) {
  const asked = [];
  const fetchFn = async (url) => {
    const target = new URL(url, window.location.href);

    asked.push(`${target.pathname}${target.search}`);

    if (target.pathname === '/api/games') {
      return reply(await catalogOf(only));
    }

    return target.pathname === '/api/leaderboard' ? reply(board, status) : reply({}, 404);
  };

  return { fetchFn, asked };
}

export const byId = (id) => document.getElementById(id);

export const texts = (selector) =>
  [...document.querySelectorAll(selector)].map((element) => element.textContent.trim());

// Opens the arcade on the leaderboard and waits for Steel & Dust's board, or its notice, to show.
export async function openLeaderboard(fetchFn, options = {}) {
  const page = renderArcade({ path: '/leaderboard/', fetch: fetchFn, ...options });

  await waitUntil(() => expect(byId('board-steel-and-dust-title')).not.toBeNull());

  return page;
}

export const stopLeaderboard = () => unmountArcade();
