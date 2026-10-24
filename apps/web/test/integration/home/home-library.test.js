// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EMPTY_MESSAGES, LIBRARY_PAGE_SIZE } from '../../../src/home/library-filter.js';
import { createMemoryStorage } from '../../../src/home/preferences.js';
import {
  bootWithGames,
  byId,
  click,
  loadHomeMarkup,
  press,
  stopHomes,
  tileTitles,
  tiles,
} from '../../support/home-harness.js';

const filter = (name) => document.querySelector(`#filters [data-filter="${name}"]`);
const libraryTitle = () => byId('library-title').textContent;

beforeEach(async () => {
  document.body.innerHTML = '';
  await loadHomeMarkup();
});

afterEach(stopHomes);

describe('the segmented control', () => {
  it('slides to the chosen filter and marks it pressed', async () => {
    await bootWithGames(['alpha', 'bravo']);
    expect(byId('filters').dataset.segment).toBe('0');
    click(filter('favorites'));
    expect(byId('filters').dataset.segment).toBe('2');
    expect(byId('filters').style.getPropertyValue('--segment')).toBe('2');
    expect(filter('favorites').getAttribute('aria-pressed')).toBe('true');
    expect(filter('all').getAttribute('aria-pressed')).toBe('false');
    expect(libraryTitle()).toBe('Favorites');
  });

  it('says how to fill an empty filter', async () => {
    await bootWithGames(['alpha', 'bravo']);
    click(filter('favorites'));
    expect(tiles()).toEqual([]);
    expect(byId('library-empty').hidden).toBe(false);
    expect(byId('library-empty').textContent).toBe(EMPTY_MESSAGES.favorites);
    click(filter('all'));
    expect(byId('library-empty').hidden).toBe(true);
    expect(tiles()).toHaveLength(2);
  });
});

describe('favorites', () => {
  it('fills the heart and lists the game under Favorites', async () => {
    await bootWithGames(['alpha', 'bravo', 'charlie']);
    press('ArrowRight');
    click(byId('favorite'));
    expect(byId('favorite').getAttribute('aria-pressed')).toBe('true');
    click(filter('favorites'));
    expect(tileTitles()).toEqual(['bravo']);
    click(byId('favorite'));
    expect(tileTitles()).toEqual([]);
  });

  it('shows the heart of each game as the selection moves', async () => {
    await bootWithGames(['alpha', 'bravo']);
    click(byId('favorite'));
    press('ArrowRight');
    expect(byId('favorite').getAttribute('aria-pressed')).toBe('false');
    press('ArrowLeft');
    expect(byId('favorite').getAttribute('aria-pressed')).toBe('true');
  });

  it('keeps favorites for the next visit', async () => {
    const storage = createMemoryStorage();
    await bootWithGames(['alpha', 'bravo'], { storage });
    click(byId('favorite'));
    stopHomes();
    await loadHomeMarkup();
    await bootWithGames(['alpha', 'bravo'], { storage });
    expect(byId('favorite').getAttribute('aria-pressed')).toBe('true');
  });
});

describe('recently played', () => {
  it('lists the games opened, newest first, and the arcade opens on the last one', async () => {
    const storage = createMemoryStorage();
    await bootWithGames(['alpha', 'bravo', 'charlie'], { storage });
    press('Enter');
    press('ArrowRight');
    press('ArrowRight');
    press('Enter');
    click(filter('recent'));
    expect(libraryTitle()).toBe('Recently Played');
    expect(tileTitles()).toEqual(['charlie', 'alpha']);
    stopHomes();
    await loadHomeMarkup();
    await bootWithGames(['alpha', 'bravo', 'charlie'], { storage });
    expect(byId('spotlight-title').textContent).toBe('charlie');
  });
});

describe('a long library', () => {
  const ids = Array.from({ length: LIBRARY_PAGE_SIZE + 2 }, (_, i) => `game-${i}`);

  it('shows a page of games, then the rest on request', async () => {
    await bootWithGames(ids);
    expect(tiles()).toHaveLength(LIBRARY_PAGE_SIZE);
    expect(byId('library-count').textContent).toBe(`Showing ${LIBRARY_PAGE_SIZE} of ${ids.length}`);
    expect(byId('library-end').hidden).toBe(true);
    click(byId('show-more'));
    expect(tiles()).toHaveLength(ids.length);
    expect(byId('show-more').hidden).toBe(true);
    expect(byId('library-end').hidden).toBe(false);
  });

  it('keeps the selected game ringed when the grid is drawn again', async () => {
    await bootWithGames(ids);
    press('ArrowLeft');
    press('ArrowLeft');
    press('ArrowLeft');
    click(byId('show-more'));
    expect(document.querySelector('.tile.is-selected').dataset.gameIndex).toBe(
      String(ids.length - 1),
    );
  });
});
