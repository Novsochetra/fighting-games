import { act } from '@testing-library/react';
import { expect, vi } from 'vitest';
import { serializeCatalog } from '../../../server/src/catalog/build-catalog.js';
import { loadCatalog } from '../../../server/src/catalog/read-catalog.js';
import { GAMES_ROOT } from '../../../server/src/paths.js';
import { renderArcade, unmountArcade, waitUntil } from './render-arcade.tsx';

export { waitUntil };

export const realCatalogJson = async () =>
  serializeCatalog(await loadCatalog({ gamesRoot: GAMES_ROOT, warn: () => {} }));

export const jsonReply = (body, status = 200) => ({
  ok: status === 200,
  status,
  json: async () => JSON.parse(body),
});

// The arcade's harness took the parts of a boot: the clock as the visit's, Google's tag as analytics.
function portsOf({ visit, analytics, ...ports }) {
  return { ...ports, now: visit?.now, analyticsTag: analytics };
}

export function startHome(fetchFn, options = {}) {
  const navigate = vi.fn();
  const page = renderArcade({ fetch: fetchFn, navigate, ...portsOf(options) });
  const { preferences, appearance, analytics } = page.arcade;

  return { navigate, page, home: { preferences, appearance, analytics } };
}

const isSettled = () => {
  const notice = byId('notice');

  return notice.hidden || notice.dataset.tone !== 'loading';
};

// Until the games, or what kept them away, show.
export const settled = () => waitUntil(() => expect(isSettled()).toBe(true));

export async function boot(fetchFn, options) {
  const started = startHome(fetchFn, options);

  await settled();

  return started;
}

export const stopHomes = () => unmountArcade();

export async function bootWithGames(ids, options) {
  const { games } = JSON.parse(await realCatalogJson());
  const base = games.find((game) => game.id === 'steel-and-dust');
  const copies = ids.map((id) => ({ ...base, id, title: id, path: `games/${id}/` }));
  return boot(async () => jsonReply(JSON.stringify({ games: copies })), options);
}

// Steel & Dust alone, as the real catalog serves it, for tests that check one game's own details
// whatever place the other games take.
export async function bootWithSteelAndDust(options) {
  const { games } = JSON.parse(await realCatalogJson());
  const body = JSON.stringify({ games: games.filter((game) => game.id === 'steel-and-dust') });
  return boot(async () => jsonReply(body), options);
}

export const bootWithRealCatalog = async (options) => {
  const body = await realCatalogJson();
  return { body, ...(await boot(async () => jsonReply(body), options)) };
};

// Each in act, so React has drawn what it did before the test looks.
export const dispatch = (target, event) => {
  act(() => {
    target.dispatchEvent(event);
  });

  return event;
};

export const press = (key, target = document) =>
  dispatch(target, new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

export const click = (target, init = {}) =>
  dispatch(
    target,
    new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init }),
  );

// The clock, faked by the test, moved in act so React draws what its timers did.
export const tick = (ms) => act(() => vi.advanceTimersByTime(ms));

export const runTimers = () => act(() => vi.runAllTimers());

// The browser bringing the arcade back from its back/forward cache, as after Back from a game;
// happy-dom's PageTransitionEvent drops the persisted flag, so the event carries it by hand.
export function restoreFromCache(persisted = true) {
  const event = new Event('pageshow');

  Object.defineProperty(event, 'persisted', { value: persisted });
  dispatch(window, event);
}

// An address on the page, which the arcade resolves against its own root.
export const onPage = (path) => new URL(path, window.location.href).href;

export const byId = (id) => document.getElementById(id);
export const cards = () => [...document.querySelectorAll('#carousel-track .card')];
export const tiles = () => [...document.querySelectorAll('#library-grid .tile')];
export const centerCard = () => document.querySelector('#carousel-track .card.is-center');
export const selectedTile = () => document.querySelector('#library-grid .tile.is-selected');
export const spotlightTitle = () => byId('spotlight-title').textContent;
export const tileTitles = () =>
  tiles().map((tile) => tile.querySelector('.tile__title').textContent);
