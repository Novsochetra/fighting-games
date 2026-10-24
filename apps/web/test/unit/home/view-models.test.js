import { describe, expect, it } from 'vitest';
import {
  formatGameCount,
  isRelativeUrl,
  monogramOf,
  toGameCard,
  toGameCards,
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
  it('maps an API game to what its icon shows', () => {
    expect(toGameCard(apiGame())).toEqual({
      id: 'steel-and-dust',
      title: 'Steel & Dust',
      monogram: 'S',
      href: 'games/steel-and-dust/',
      coverSrc: 'games/steel-and-dust/assets/icons/icon-512.png',
    });
  });

  it('leaves the cover empty when the game has none', () => {
    expect(toGameCard({ title: 'Bare', path: 'games/bare/' }).coverSrc).toBe('');
  });

  it('drops a cover that is not a plain relative URL', () => {
    expect(toGameCard(apiGame({ cover: 'javascript:alert(1)' })).coverSrc).toBe('');
  });
});

describe('monogramOf', () => {
  it.each([
    ['Steel & Dust', 'S'],
    ['  neon drift', 'N'],
    ['ångström', 'Å'],
    ['👾 Invaders', '👾'],
    ['', ''],
    [undefined, ''],
  ])('takes %j as %j', (title, expected) => {
    expect(monogramOf(title)).toBe(expected);
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

describe('toGameCards', () => {
  it('keeps the catalog order', () => {
    const games = ['a', 'b', 'c'].map((id) => apiGame({ id, title: id, path: `games/${id}/` }));
    expect(toGameCards(games).map((card) => card.id)).toEqual(['a', 'b', 'c']);
  });

  it('leaves out games that cannot be linked to', () => {
    const games = [
      apiGame({ path: 'javascript:alert(1)' }),
      apiGame({ title: '' }),
      null,
      apiGame(),
    ];
    expect(toGameCards(games).map((card) => card.id)).toEqual(['steel-and-dust']);
  });

  it('has no cards for no games', () => {
    expect(toGameCards([])).toEqual([]);
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
