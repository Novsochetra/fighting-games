// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COMING_SOON_COUNT } from '../../../src/home/coming-soon.js';
import { EMPTY_MESSAGE, ERROR_MESSAGE } from '../../../src/home/home-view.js';
import {
  boot,
  bootWithRealCatalog,
  bootWithSteelAndDust,
  byId,
  cards,
  centerCard,
  click,
  jsonReply,
  loadHomeMarkup,
  press,
  realCatalogJson,
  selectedTile,
  spotlightTitle,
  startHome,
  stopHomes,
  tiles,
} from '../../support/home-harness.js';

beforeEach(async () => {
  document.body.innerHTML = '';
  await loadHomeMarkup();
});

afterEach(stopHomes);

describe('home page with the real catalog', () => {
  it('fetches the relative api/games URL and shows a card and a tile per game', async () => {
    const body = await realCatalogJson();
    const fetchFn = vi.fn(async () => jsonReply(body));
    await boot(fetchFn);
    expect(fetchFn).toHaveBeenCalledWith('api/games', expect.any(Object));
    const { games } = JSON.parse(body);
    expect(cards()).toHaveLength(games.length + COMING_SOON_COUNT);
    expect(tiles()).toHaveLength(games.length);
    const [first] = games;
    expect(cards()[0].getAttribute('aria-label')).toBe(first.title);
    expect(cards()[0].querySelector('img').getAttribute('src')).toBe(first.screenshot);
    expect(tiles()[0].textContent).toContain(first.genre);
  });

  it('puts the first game in the spotlight, with its art behind the carousel', async () => {
    await bootWithSteelAndDust();
    expect(spotlightTitle()).toBe('Steel & Dust');
    expect(byId('spotlight-meta').textContent).toBe("Beat 'em up · 1 player · 2026");
    expect(byId('spotlight-summary').textContent).toBe('A side-scrolling pixel-art brawler.');
    expect(byId('play').getAttribute('href')).toBe('games/steel-and-dust/');
    expect(byId('play').getAttribute('aria-label')).toBe('Play Steel & Dust');
    const backdrop = byId('backdrops').querySelector('.backdrop.is-active');
    expect(backdrop.querySelector('source').getAttribute('srcset')).toBe(
      'games/steel-and-dust/assets/ui/select/bg-portrait.png',
    );
  });

  it('rings the selected card and tile and keeps only that card in the tab order', async () => {
    await bootWithSteelAndDust();
    expect(centerCard()).toBe(cards()[0]);
    expect(centerCard().getAttribute('aria-current')).toBe('true');
    expect(cards().filter((card) => card.tabIndex === 0)).toEqual([centerCard()]);
    expect(selectedTile()).toBe(tiles()[0]);
    expect(byId('notice').hidden).toBe(true);
    expect(byId('stage').hidden).toBe(false);
    expect(byId('library').hidden).toBe(false);
    expect(byId('library-count').textContent).toBe('1 game');
  });

  it('shows a frame of play on the card, not the key art behind it', async () => {
    await bootWithRealCatalog();
    const card = cards()[0].querySelector('img').getAttribute('src');
    const backdrop = byId('backdrops').querySelector('.backdrop.is-active img').getAttribute('src');
    expect(card).not.toBe(backdrop);
  });

  it('gives every card, teasers too, a page dot, with the arrows to move between them', async () => {
    await bootWithRealCatalog();
    expect(byId('pager').children).toHaveLength(cards().length);
    expect(byId('pager').hidden).toBe(false);
    expect(byId('previous').hidden).toBe(false);
    expect(byId('next').hidden).toBe(false);
  });

  it('opens the selected game with Enter or Space, and with a click on its card', async () => {
    const { navigate } = await bootWithSteelAndDust();
    expect(press('Enter').defaultPrevented).toBe(true);
    expect(navigate).toHaveBeenLastCalledWith('games/steel-and-dust/');
    press(' ');
    click(centerCard());
    expect(navigate).toHaveBeenCalledTimes(3);
  });

  it('leaves Enter on a focused button to the button', async () => {
    const { navigate } = await bootWithRealCatalog();
    expect(press('Enter', byId('favorite')).defaultPrevented).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('opens a game from Play in place of following the link', async () => {
    const { navigate } = await bootWithSteelAndDust();
    const event = click(byId('play'));
    expect(event.defaultPrevented).toBe(true);
    expect(navigate).toHaveBeenCalledWith('games/steel-and-dust/');
  });

  it('leaves a modified click on Play to the browser, which opens a new tab', async () => {
    const { navigate } = await bootWithRealCatalog();
    const event = click(byId('play'), { metaKey: true });
    expect(event.defaultPrevented).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe('a game hosted on its own site', () => {
  it('lists Morodok Angkor, keeps its rendered art smooth and opens its own site', async () => {
    const { navigate } = await bootWithRealCatalog();
    const tile = tiles().find((candidate) => candidate.textContent.includes('Morodok Angkor'));
    click(tile);
    expect(spotlightTitle()).toBe('Morodok Angkor');
    expect(centerCard().querySelector('img').classList.contains('is-smooth')).toBe(true);
    const backdrop = byId('backdrops').querySelector('.backdrop.is-active img');
    expect(backdrop.classList.contains('is-smooth')).toBe(true);
    expect(byId('play').getAttribute('href')).toBe('https://morodokangkor.com/');
    click(byId('play'));
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('https://morodokangkor.com/'));
  });
});

describe('home page loading, errors and an empty catalog', () => {
  it('shows the loading notice until the catalog arrives', async () => {
    let resolveFetch;
    const pending = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    const { home } = startHome(() => pending);
    expect(byId('notice').dataset.tone).toBe('loading');
    expect(byId('stage').hidden).toBe(true);
    expect(byId('library').hidden).toBe(true);
    resolveFetch(jsonReply(await realCatalogJson()));
    await home.ready;
    expect(byId('stage').hidden).toBe(false);
  });

  it('shows an error with a retry button, and the retry loads the games', async () => {
    const body = await realCatalogJson();
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(jsonReply('{}', 503))
      .mockResolvedValue(jsonReply(body));
    const { home } = await boot(fetchFn);
    const retry = byId('retry');
    expect(byId('status').textContent).toBe(ERROR_MESSAGE);
    expect(retry.hidden).toBe(false);
    expect(byId('stage').hidden).toBe(true);
    expect(press('Enter', retry).defaultPrevented).toBe(false);

    click(retry);
    await vi.waitFor(() => expect(cards().length).toBeGreaterThan(0));
    expect(home.controller.selectedIndex()).toBe(0);
    expect(retry.hidden).toBe(true);
  });

  it('says there are no games yet when the catalog is empty', async () => {
    const { navigate } = await boot(async () => jsonReply('{"games":[]}'));
    expect(byId('status').textContent).toBe(EMPTY_MESSAGE);
    expect(byId('notice').dataset.tone).toBe('empty');
    expect(byId('retry').hidden).toBe(true);
    expect(byId('library').hidden).toBe(true);
    press('Enter');
    expect(navigate).not.toHaveBeenCalled();
  });
});
