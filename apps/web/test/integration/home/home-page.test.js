// @vitest-environment happy-dom
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { serializeCatalog } from '../../../../server/src/catalog/build-catalog.js';
import { loadCatalog } from '../../../../server/src/catalog/read-catalog.js';
import { GAMES_ROOT, WEB_ROOT } from '../../../../server/src/paths.js';
import { bootHome } from '../../../src/home/boot.js';
import { ERROR_MESSAGE } from '../../../src/home/home-view.js';

const realCatalogJson = async () =>
  serializeCatalog(await loadCatalog({ gamesRoot: GAMES_ROOT, warn: () => {} }));

const jsonReply = (body, status = 200) => ({
  ok: status === 200,
  status,
  json: async () => JSON.parse(body),
});

// Only the body: the head's stylesheet and module links would make happy-dom try to fetch them.
async function loadHomeMarkup() {
  const html = await readFile(path.join(WEB_ROOT, 'index.html'), 'utf8');
  const [, bodyMarkup] = /<body[^>]*>([\s\S]*)<\/body>/.exec(html);
  expect(bodyMarkup).not.toMatch(/<script|<link/);
  document.body.innerHTML = bodyMarkup;
}

const bootedHomes = [];

function startHome(fetchFn) {
  const navigate = vi.fn();
  const home = bootHome({ document, fetch: fetchFn, navigate });
  bootedHomes.push(home);
  return { navigate, home };
}

async function boot(fetchFn) {
  const started = startHome(fetchFn);
  await started.home.ready;
  return started;
}

const press = (key, target = document) => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
};

const gameLinks = () => [...document.querySelectorAll('#shelf a.cart')];
const selectedLink = () => document.querySelector('#shelf .cart.is-selected');

beforeEach(async () => {
  document.body.innerHTML = '';
  await loadHomeMarkup();
});

afterEach(() => {
  bootedHomes.splice(0).forEach((home) => home.stop());
});

describe('home page with the real catalog', () => {
  it('fetches the relative api/games URL and shows a cartridge per game', async () => {
    const body = await realCatalogJson();
    const fetchFn = vi.fn(async () => jsonReply(body));
    await boot(fetchFn);
    expect(fetchFn).toHaveBeenCalledWith('api/games', expect.any(Object));

    const { games } = JSON.parse(body);
    const links = gameLinks();
    expect(links).toHaveLength(games.length);
    const steel = links.find((link) => link.getAttribute('href') === 'games/steel-and-dust/');
    expect(steel.querySelector('.cart__title').textContent).toBe('Steel & Dust');
    expect(steel.querySelector('.cart__tagline').textContent).toBe('Pixel brawler');
    expect(steel.querySelector('img').getAttribute('src')).toBe(
      'games/steel-and-dust/assets/icons/icon-512.png',
    );
    expect(steel.querySelectorAll('.badge').length).toBeGreaterThan(0);
  });

  it('fills the shelf with coming soon slots that cannot be selected', async () => {
    const body = await realCatalogJson();
    await boot(async () => jsonReply(body));
    const empties = [...document.querySelectorAll('#shelf .slot--empty')];
    expect(empties.length).toBeGreaterThan(0);
    for (const slot of empties) {
      expect(slot.textContent).toContain('Coming soon');
      expect(slot.querySelector('a, [tabindex], [data-game-index]')).toBeNull();
    }
  });

  it('selects the first game, shows its description and counts the games', async () => {
    const body = await realCatalogJson();
    await boot(async () => jsonReply(body));
    const first = JSON.parse(body).games[0];
    expect(selectedLink()).toBe(gameLinks()[0]);
    expect(selectedLink().tabIndex).toBe(0);
    expect(document.getElementById('readout').hidden).toBe(false);
    expect(document.getElementById('readout-text').textContent).toBe(first.description);
    expect(document.getElementById('notice').hidden).toBe(true);
    expect(document.getElementById('game-count').textContent).toMatch(/\d+ games?/);
  });

  it('starts the selected game with Enter or Space', async () => {
    const body = await realCatalogJson();
    const { navigate } = await boot(async () => jsonReply(body));
    const enter = press('Enter');
    expect(enter.defaultPrevented).toBe(true);
    expect(navigate).toHaveBeenLastCalledWith('games/steel-and-dust/');
    press(' ', gameLinks()[0]);
    expect(navigate).toHaveBeenCalledTimes(2);
  });

  it('keeps the only game selected and focused when arrows are pressed', async () => {
    const body = await realCatalogJson();
    await boot(async () => jsonReply(body));
    expect(press('ArrowRight').defaultPrevented).toBe(true);
    expect(selectedLink().getAttribute('href')).toBe('games/steel-and-dust/');
    expect(document.activeElement).toBe(selectedLink());
  });
});

describe('home page navigation with several games', () => {
  async function bootWithThreeGames() {
    const { games } = JSON.parse(await realCatalogJson());
    const base = games.find((game) => game.id === 'steel-and-dust');
    const copies = ['alpha', 'bravo', 'charlie'].map((id) => ({
      ...base,
      id,
      title: id,
      path: `games/${id}/`,
    }));
    return boot(async () => jsonReply(JSON.stringify({ games: copies })));
  }

  it('moves with arrows and WASD, wrapping left and right', async () => {
    await bootWithThreeGames();
    const hrefOfSelected = () => selectedLink().getAttribute('href');
    press('ArrowRight');
    expect(hrefOfSelected()).toBe('games/bravo/');
    press('d');
    expect(hrefOfSelected()).toBe('games/charlie/');
    press('ArrowRight');
    expect(hrefOfSelected()).toBe('games/alpha/');
    press('a');
    expect(hrefOfSelected()).toBe('games/charlie/');
    press('w');
    expect(hrefOfSelected()).toBe('games/bravo/');
    press('ArrowDown');
    expect(hrefOfSelected()).toBe('games/charlie/');
    expect(document.activeElement).toBe(selectedLink());
    expect(gameLinks().filter((link) => link.tabIndex === 0)).toEqual([selectedLink()]);
  });

  it('starts the game that was moved to', async () => {
    const { navigate } = await bootWithThreeGames();
    press('ArrowRight');
    press('Enter');
    expect(navigate).toHaveBeenCalledWith('games/bravo/');
  });

  it('selects a cartridge when the pointer moves over it', async () => {
    await bootWithThreeGames();
    const third = gameLinks()[2];
    third.querySelector('.cart__title').dispatchEvent(new Event('pointerover', { bubbles: true }));
    expect(selectedLink()).toBe(third);
    expect(document.getElementById('readout-title').textContent).toBe('charlie');
  });
});

describe('home page loading and errors', () => {
  it('shows the loading notice until the catalog arrives', async () => {
    let resolveFetch;
    const pending = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    const { home } = startHome(() => pending);
    expect(document.getElementById('notice').dataset.tone).toBe('loading');
    expect(document.getElementById('shelf').hidden).toBe(true);
    resolveFetch(jsonReply(await realCatalogJson()));
    await home.ready;
    expect(document.getElementById('shelf').hidden).toBe(false);
  });

  it('shows an error with a retry button, and the retry loads the games', async () => {
    const body = await realCatalogJson();
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(jsonReply('{}', 503))
      .mockResolvedValue(jsonReply(body));
    const { home } = await boot(fetchFn);
    const retry = document.getElementById('retry');
    expect(document.getElementById('status').textContent).toBe(ERROR_MESSAGE);
    expect(retry.hidden).toBe(false);
    expect(document.getElementById('shelf').hidden).toBe(true);
    expect(press('Enter', retry).defaultPrevented).toBe(false);

    retry.click();
    await vi.waitFor(() => expect(gameLinks().length).toBeGreaterThan(0));
    expect(home.controller.selectedIndex()).toBe(0);
    expect(retry.hidden).toBe(true);
  });
});
