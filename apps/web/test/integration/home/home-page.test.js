// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EMPTY_MESSAGE, ERROR_MESSAGE } from '../../../src/home/home-view.js';
import {
  boot,
  bootWithRealCatalog,
  gameLinks,
  jsonReply,
  loadHomeMarkup,
  press,
  realCatalogJson,
  selectedLink,
  startHome,
  stopHomes,
} from '../../support/home-harness.js';

beforeEach(async () => {
  document.body.innerHTML = '';
  delete document.documentElement.dataset.input;
  await loadHomeMarkup();
});

afterEach(stopHomes);

describe('home page with the real catalog', () => {
  it('fetches the relative api/games URL and shows a labeled icon per game', async () => {
    const body = await realCatalogJson();
    const fetchFn = vi.fn(async () => jsonReply(body));
    await boot(fetchFn);
    expect(fetchFn).toHaveBeenCalledWith('api/games', expect.any(Object));

    const { games } = JSON.parse(body);
    const links = gameLinks();
    expect(links).toHaveLength(games.length);
    const steel = links.find((link) => link.getAttribute('href') === 'games/steel-and-dust/');
    expect(steel.querySelector('.app__label').textContent).toBe('Steel & Dust');
    expect(steel.textContent.trim()).toBe('Steel & Dust');
    expect(steel.querySelector('.app__icon img').getAttribute('src')).toBe(
      'games/steel-and-dust/assets/icons/icon-512.png',
    );
  });

  it('selects the first game, counts the games and hides the notice', async () => {
    await bootWithRealCatalog();
    expect(selectedLink()).toBe(gameLinks()[0]);
    expect(selectedLink().tabIndex).toBe(0);
    expect(document.getElementById('notice').hidden).toBe(true);
    expect(document.getElementById('app-grid').hidden).toBe(false);
    expect(document.getElementById('game-count').textContent).toMatch(/\d+ games?/);
  });

  it('opens the selected game with Enter or Space', async () => {
    const { navigate } = await bootWithRealCatalog();
    const enter = press('Enter');
    expect(enter.defaultPrevented).toBe(true);
    expect(navigate).toHaveBeenLastCalledWith('games/steel-and-dust/');
    press(' ', gameLinks()[0]);
    expect(navigate).toHaveBeenCalledTimes(2);
  });

  it('keeps the only game selected and focused when arrows are pressed', async () => {
    await bootWithRealCatalog();
    expect(press('ArrowRight').defaultPrevented).toBe(true);
    expect(selectedLink().getAttribute('href')).toBe('games/steel-and-dust/');
    expect(document.activeElement).toBe(selectedLink());
  });

  it('opens a game on a plain click in place of following the link', async () => {
    const { navigate } = await bootWithRealCatalog();
    const label = gameLinks()[0].querySelector('.app__label');
    const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    label.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(navigate).toHaveBeenCalledWith('games/steel-and-dust/');
  });

  it('leaves a modified click to the browser, which opens a new tab', async () => {
    const { navigate } = await bootWithRealCatalog();
    const click = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      button: 0,
      metaKey: true,
    });
    gameLinks()[0].dispatchEvent(click);
    expect(click.defaultPrevented).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe('home page loading, errors and an empty catalog', () => {
  it('shows the loading notice until the catalog arrives', async () => {
    let resolveFetch;
    const pending = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    const { home } = startHome(() => pending);
    expect(document.getElementById('notice').dataset.tone).toBe('loading');
    expect(document.getElementById('app-grid').hidden).toBe(true);
    resolveFetch(jsonReply(await realCatalogJson()));
    await home.ready;
    expect(document.getElementById('app-grid').hidden).toBe(false);
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
    expect(document.getElementById('app-grid').hidden).toBe(true);
    expect(press('Enter', retry).defaultPrevented).toBe(false);

    retry.click();
    await vi.waitFor(() => expect(gameLinks().length).toBeGreaterThan(0));
    expect(home.controller.selectedIndex()).toBe(0);
    expect(retry.hidden).toBe(true);
  });

  it('says there are no games yet when the catalog is empty', async () => {
    const { navigate } = await boot(async () => jsonReply('{"games":[]}'));
    expect(document.getElementById('status').textContent).toBe(EMPTY_MESSAGE);
    expect(document.getElementById('notice').dataset.tone).toBe('empty');
    expect(document.getElementById('retry').hidden).toBe(true);
    expect(document.getElementById('game-count').textContent).toBe('No games yet');
    press('Enter');
    expect(navigate).not.toHaveBeenCalled();
  });
});
