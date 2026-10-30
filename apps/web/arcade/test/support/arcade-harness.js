import { act } from '@testing-library/react';
import { expect, vi } from 'vitest';
import { routeOf } from '@/navigation/routes/screens.ts';
import { realCatalogJson } from './home-harness.js';
import { renderArcade, unmountArcade, waitUntil } from './render-arcade.tsx';
import { sampleBoard } from './leaderboard-harness.js';
import { samplePayload } from './supporters-harness.js';

export const ORIGIN = new URL('/', window.location.href).href;

const reply = (body, status = 200) => ({
  ok: status === 200,
  status,
  json: async () => JSON.parse(body),
});

// Stands in for the server's API: the real catalog, a sample list of supporters and a sample board.
export function arcadeFetch() {
  const answers = {
    '/api/supporters': () => JSON.stringify(samplePayload()),
    '/api/leaderboard': () => JSON.stringify(sampleBoard()),
  };

  return vi.fn(async (url) => {
    const { pathname } = new URL(url, window.location.href);

    if (pathname === '/api/games') {
      return reply(await realCatalogJson());
    }

    return answers[pathname] ? reply(answers[pathname]()) : reply('{}', 404);
  });
}

// What the arcade asked the server for besides its API: nothing, as its screens come with it.
export const pageRequests = (fetchFn) =>
  fetchFn.mock.calls
    .map(([url]) => new URL(url, ORIGIN).pathname)
    .filter((pathname) => !pathname.startsWith('/api/'));

// The arcade as a visitor opens it at one of its screens' pages.
export function startArcadeAt(id, { referrer = '', ...ports } = {}) {
  const fetchFn = arcadeFetch();
  const navigate = vi.fn();
  const page = renderArcade({ path: routeOf(id), fetch: fetchFn, navigate, referrer, ...ports });

  return { ...page, fetchFn, navigate };
}

export const stopArcades = () => unmountArcade();

export const screenOf = (id) => document.querySelector(`.screen-layer[data-screen="${id}"]`);

export const showing = () =>
  [...document.querySelectorAll('.screen-layer:not(.screen-layer--hidden)')].map(
    (layer) => layer.dataset.screen,
  );

export function tap(target, init = {}) {
  act(() => {
    target.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init }),
    );
  });
}

// Until the move between screens has played and settled.
export const changed = () =>
  waitUntil(() => expect(document.querySelector('.screen-layer--front')).toBeNull());

export const homeLoaded = () =>
  waitUntil(() =>
    expect(document.querySelectorAll('#carousel-track .card').length).toBeGreaterThan(0),
  );
