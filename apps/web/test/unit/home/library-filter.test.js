import { describe, expect, it } from 'vitest';
import {
  EMPTY_MESSAGES,
  FILTERS,
  LIBRARY_PAGE_SIZE,
  filterEntries,
  isFilter,
  libraryPage,
} from '../../../src/home/library-filter.js';

const cards = (count) => Array.from({ length: count }, (_, i) => ({ id: `game-${i}` }));
const ids = (entries) => entries.map(({ card }) => card.id);
const none = { favorites: [], recent: [], expanded: false };

describe('filterEntries', () => {
  it('keeps every game in catalog order, with its catalog index', () => {
    const entries = filterEntries(cards(3), { ...none, filter: 'all' });
    expect(entries.map(({ index }) => index)).toEqual([0, 1, 2]);
  });

  it('keeps the favorites in catalog order', () => {
    const favorites = ['game-2', 'game-0'];
    expect(ids(filterEntries(cards(3), { ...none, filter: 'favorites', favorites }))).toEqual([
      'game-0',
      'game-2',
    ]);
  });

  it('lists the games played most recently first and skips ones that left the catalog', () => {
    const recent = ['game-2', 'gone', 'game-0'];
    const entries = filterEntries(cards(3), { ...none, filter: 'recent', recent });
    expect(ids(entries)).toEqual(['game-2', 'game-0']);
    expect(entries.map(({ index }) => index)).toEqual([2, 0]);
  });
});

describe('libraryPage', () => {
  it('shows a page of games, then all of them once expanded', () => {
    const first = libraryPage(cards(12), { ...none, filter: 'all' });
    expect(first.entries).toHaveLength(LIBRARY_PAGE_SIZE);
    expect(first).toMatchObject({
      title: 'All Games',
      label: `Showing ${LIBRARY_PAGE_SIZE} of 12`,
      canShowMore: true,
      isAtEnd: false,
      emptyMessage: '',
    });
    const all = libraryPage(cards(12), { ...none, filter: 'all', expanded: true });
    expect(all.entries).toHaveLength(12);
    expect(all).toMatchObject({ label: '12 games', canShowMore: false, isAtEnd: true });
  });

  it('counts a short library plainly, with nothing more to show', () => {
    expect(libraryPage(cards(1), { ...none, filter: 'all' })).toMatchObject({
      label: '1 game',
      canShowMore: false,
      isAtEnd: false,
    });
  });

  it('never pages the favorites or the recent games', () => {
    const favorites = cards(10).map((card) => card.id);
    const page = libraryPage(cards(10), { ...none, filter: 'favorites', favorites });
    expect(page).toMatchObject({ title: 'Favorites', label: '10 games', canShowMore: false });
    expect(page.entries).toHaveLength(10);
  });

  it('says what to do when a filter has no games', () => {
    expect(libraryPage(cards(3), { ...none, filter: 'favorites' })).toMatchObject({
      label: 'No games yet',
      emptyMessage: EMPTY_MESSAGES.favorites,
    });
    expect(libraryPage(cards(3), { ...none, filter: 'recent' })).toMatchObject({
      title: 'Recently Played',
      emptyMessage: EMPTY_MESSAGES.recent,
    });
  });
});

describe('isFilter', () => {
  it('knows the three segments and nothing else', () => {
    expect(FILTERS.every(isFilter)).toBe(true);
    expect(isFilter('playable')).toBe(false);
    expect(isFilter(undefined)).toBe(false);
  });
});
