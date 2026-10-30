import { describe, expect, it } from 'vitest';
import {
  COMING_SOON_COUNT,
  COMING_SOON_TITLE,
  comingSoonCard,
  isPlayable,
  withComingSoon,
} from '@/api/catalog/coming-soon.js';
import { libraryPage } from '@/screens/home/library/library-filter.js';

const games = [{ id: 'a' }, { id: 'b' }];

describe('withComingSoon', () => {
  it('closes the carousel with two teasers after the games', () => {
    const cards = withComingSoon(games);
    expect(COMING_SOON_COUNT).toBe(2);
    expect(cards.map((card) => card.id)).toEqual(['a', 'b', 'coming-soon-1', 'coming-soon-2']);
  });

  it('adds nothing to an empty arcade', () => {
    expect(withComingSoon([])).toEqual([]);
  });
});

describe('comingSoonCard', () => {
  it('is a teaser with nothing to open and no art', () => {
    const teaser = comingSoonCard(1);
    expect(teaser).toMatchObject({
      title: COMING_SOON_TITLE,
      href: '',
      artSrc: '',
      bannerSrc: '',
      isComingSoon: true,
    });
    expect(isPlayable(teaser)).toBe(false);
    expect(isPlayable(games[0])).toBe(true);
  });
});

describe('the library', () => {
  it('lists and counts only the games, never the teasers', () => {
    const page = libraryPage(withComingSoon(games), {
      filter: 'all',
      favorites: ['coming-soon-1'],
      recent: [],
      expanded: false,
    });
    expect(page.entries.map(({ card }) => card.id)).toEqual(['a', 'b']);
    expect(page.label).toBe('2 games');
  });
});
