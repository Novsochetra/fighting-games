import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, vi } from 'vitest';
import { serializeCatalog } from '../../../server/src/catalog/build-catalog.js';
import { loadCatalog } from '../../../server/src/catalog/read-catalog.js';
import { GAMES_ROOT, WEB_ROOT } from '../../../server/src/paths.js';
import { bootHome } from '../../src/home/boot.js';

export const realCatalogJson = async () =>
  serializeCatalog(await loadCatalog({ gamesRoot: GAMES_ROOT, warn: () => {} }));

export const jsonReply = (body, status = 200) => ({
  ok: status === 200,
  status,
  json: async () => JSON.parse(body),
});

// Only the body: the head's stylesheet and module links would make happy-dom try to fetch them.
export async function loadHomeMarkup() {
  const html = await readFile(path.join(WEB_ROOT, 'index.html'), 'utf8');
  const [, bodyMarkup] = /<body[^>]*>([\s\S]*)<\/body>/.exec(html);
  expect(bodyMarkup).not.toMatch(/<script|<link/);
  document.body.innerHTML = bodyMarkup;
}

const bootedHomes = [];

export function startHome(fetchFn, options = {}) {
  const navigate = vi.fn();
  const home = bootHome({ document, fetch: fetchFn, navigate, ...options });
  bootedHomes.push(home);
  return { navigate, home };
}

export async function boot(fetchFn, options) {
  const started = startHome(fetchFn, options);
  await started.home.ready;
  return started;
}

export const stopHomes = () => bootedHomes.splice(0).forEach((home) => home.stop());

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

export const press = (key, target = document) => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
};

export const click = (target, init = {}) => {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init });
  target.dispatchEvent(event);
  return event;
};

export const byId = (id) => document.getElementById(id);
export const cards = () => [...document.querySelectorAll('#carousel-track .card')];
export const tiles = () => [...document.querySelectorAll('#library-grid .tile')];
export const centerCard = () => document.querySelector('#carousel-track .card.is-center');
export const selectedTile = () => document.querySelector('#library-grid .tile.is-selected');
export const spotlightTitle = () => byId('spotlight-title').textContent;
export const tileTitles = () =>
  tiles().map((tile) => tile.querySelector('.tile__title').textContent);
