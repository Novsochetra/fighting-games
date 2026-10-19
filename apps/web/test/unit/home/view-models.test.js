import { describe, expect, it } from 'vitest';
import {
  MIN_SHELF_SLOTS,
  buildShelf,
  formatGameCount,
  isRelativeUrl,
  toGameCard,
} from '../../../src/home/view-models.js';

const apiGame = (overrides = {}) => ({
  id: 'steel-and-dust',
  title: 'Steel & Dust',
  tagline: 'Pixel brawler',
  description: 'A side-scrolling pixel-art brawler.',
  genre: "Beat 'em up",
  players: '1 player',
  controls: ['Keyboard', 'Gamepad', 'Touch'],
  cover: 'games/steel-and-dust/assets/icons/icon-512.png',
  path: 'games/steel-and-dust/',
  ...overrides,
});

describe('toGameCard', () => {
  it('maps an API game to what a card shows', () => {
    expect(toGameCard(apiGame())).toEqual({
      id: 'steel-and-dust',
      title: 'Steel & Dust',
      tagline: 'Pixel brawler',
      description: 'A side-scrolling pixel-art brawler.',
      genre: "Beat 'em up",
      players: '1 player',
      href: 'games/steel-and-dust/',
      coverSrc: 'games/steel-and-dust/assets/icons/icon-512.png',
      controls: ['Keyboard', 'Gamepad', 'Touch'],
    });
  });

  it('fills missing optional fields with empty values', () => {
    const card = toGameCard({ title: 'Bare', path: 'games/bare/' });
    expect(card).toMatchObject({ tagline: '', genre: '', players: '', coverSrc: '', controls: [] });
  });

  it('drops a cover that is not a plain relative URL', () => {
    expect(toGameCard(apiGame({ cover: 'javascript:alert(1)' })).coverSrc).toBe('');
  });

  it('keeps only text controls', () => {
    expect(toGameCard(apiGame({ controls: ['Keyboard', 3, '', null] })).controls).toEqual([
      'Keyboard',
    ]);
  });
});

describe('isRelativeUrl', () => {
  it.each(['games/steel-and-dust/', 'games/a/assets/icon-512.png', 'play'])('accepts %s', (url) => {
    expect(isRelativeUrl(url)).toBe(true);
  });

  it.each([
    'javascript:alert(1)',
    '//evil.example/',
    '/games/abs/',
    'https://example.com/',
    'games/../../secret',
    '../up',
    'games/a b/',
    '',
    42,
  ])('refuses %j', (url) => {
    expect(isRelativeUrl(url)).toBe(false);
  });
});

describe('buildShelf', () => {
  it('pads a short shelf with coming soon slots', () => {
    const shelf = buildShelf([apiGame()]);
    expect(shelf.cards).toHaveLength(1);
    expect(shelf.emptySlotCount).toBe(MIN_SHELF_SLOTS - 1);
  });

  it('adds no empty slots once the shelf is full', () => {
    const games = Array.from({ length: 5 }, (_, i) =>
      apiGame({ id: `g${i}`, path: `games/g${i}/` }),
    );
    expect(buildShelf(games).emptySlotCount).toBe(0);
  });

  it('shows only empty slots when there are no games', () => {
    expect(buildShelf([])).toEqual({ cards: [], emptySlotCount: MIN_SHELF_SLOTS });
  });

  it('leaves out games that cannot be linked to', () => {
    const games = [
      apiGame({ path: 'javascript:alert(1)' }),
      apiGame({ title: '' }),
      null,
      apiGame(),
    ];
    expect(buildShelf(games).cards.map((card) => card.id)).toEqual(['steel-and-dust']);
  });
});

describe('formatGameCount', () => {
  it.each([
    [0, 'No games yet'],
    [1, '1 game'],
    [3, '3 games'],
  ])('describes %i as %s', (count, expected) => {
    expect(formatGameCount(count)).toBe(expected);
  });
});
