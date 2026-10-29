import { describe, expect, it } from 'vitest';
import {
  firstSentence,
  formatGameCount,
  metaLine,
  isRelativeUrl,
  monogramOf,
  toGameCard,
  toGameCards,
} from '../../../src/home/view-models.js';

const apiGame = (overrides = {}) => ({
  id: 'steel-and-dust',
  title: 'Steel & Dust',
  tagline: 'Pixel brawler',
  description: 'A side-scrolling pixel-art brawler. Pick a hero and fight.',
  genre: "Beat 'em up",
  players: '1 player',
  year: 2026,
  controls: ['Keyboard', 'Gamepad', 'Touch'],
  cover: 'games/steel-and-dust/assets/icons/icon-512.png',
  banner: 'games/steel-and-dust/assets/banner.png',
  poster: 'games/steel-and-dust/assets/poster.png',
  screenshot: 'games/steel-and-dust/assets/screenshot.png',
  path: 'games/steel-and-dust/',
  ...overrides,
});

describe('toGameCard', () => {
  it('maps an API game to what its card, tile and details show', () => {
    expect(toGameCard(apiGame())).toEqual({
      id: 'steel-and-dust',
      title: 'Steel & Dust',
      monogram: 'S',
      href: 'games/steel-and-dust/',
      smoothArt: false,
      coverSrc: 'games/steel-and-dust/assets/icons/icon-512.png',
      bannerSrc: 'games/steel-and-dust/assets/banner.png',
      posterSrc: 'games/steel-and-dust/assets/poster.png',
      artSrc: 'games/steel-and-dust/assets/screenshot.png',
      trailerSrc: '',
      genre: "Beat 'em up",
      meta: "Beat 'em up · 1 player · 2026",
      summary: 'A side-scrolling pixel-art brawler.',
      description: 'A side-scrolling pixel-art brawler. Pick a hero and fight.',
      controls: ['Keyboard', 'Gamepad', 'Touch'],
      board: null,
    });
  });

  it("names a game's board: its heroes and difficulties as the game calls them", () => {
    const leaderboard = {
      heroes: [{ id: 'moss', name: 'Moss Shade' }, { id: 'bad', name: '' }, null],
      missions: 12,
      difficulties: ['Easy', 'Normal', 'Hard'],
    };
    expect(toGameCard(apiGame({ leaderboard })).board).toEqual({
      heroes: { moss: 'Moss Shade' },
      difficulties: ['Easy', 'Normal', 'Hard'],
    });
    expect(toGameCard(apiGame({ leaderboard: { heroes: 'all' } })).board).toBeNull();
  });

  it('falls back from the screenshot or the poster to the banner, then to the cover', () => {
    const noShot = toGameCard(apiGame({ screenshot: undefined }));
    expect(noShot.artSrc).toBe('games/steel-and-dust/assets/banner.png');
    const noPoster = toGameCard(apiGame({ poster: undefined }));
    expect(noPoster.posterSrc).toBe('games/steel-and-dust/assets/banner.png');
    const coverOnly = toGameCard(
      apiGame({ banner: undefined, poster: undefined, screenshot: undefined }),
    );
    expect(coverOnly.artSrc).toBe('games/steel-and-dust/assets/icons/icon-512.png');
    expect(coverOnly.bannerSrc).toBe('games/steel-and-dust/assets/icons/icon-512.png');
    expect(coverOnly.posterSrc).toBe(coverOnly.bannerSrc);
  });

  it('leaves the art empty when the game has none', () => {
    const bare = toGameCard({ title: 'Bare', path: 'games/bare/' });
    expect([bare.coverSrc, bare.bannerSrc, bare.posterSrc, bare.artSrc]).toEqual(['', '', '', '']);
    expect(bare.controls).toEqual([]);
    expect(bare.meta).toBe('');
  });

  it('plays a trailer from inside the arcade, and none for a game without one', () => {
    const trailer = 'games/steel-and-dust/assets/trailer/trailer.mp4';

    expect(toGameCard(apiGame({ trailer })).trailerSrc).toBe(trailer);
    expect(toGameCard(apiGame()).trailerSrc).toBe('');
  });

  it.each(['https://evil.example/trailer.mp4', 'javascript:alert(1)', '//evil.example/a.mp4', 42])(
    'plays no trailer from %j, since the catalog is data',
    (trailer) => {
      expect(toGameCard(apiGame({ trailer })).trailerSrc).toBe('');
    },
  );

  it('opens a game hosted on its own site at its url, and keeps its rendered art smooth', () => {
    const card = toGameCard(apiGame({ url: 'https://morodokangkor.com/', pixelArt: false }));
    expect(card.href).toBe('https://morodokangkor.com/');
    expect(card.smoothArt).toBe(true);
  });

  it.each([
    'http://morodokangkor.com/',
    'javascript:alert(1)',
    '//evil.example/',
    'https://user:secret@morodokangkor.com/',
    'https://morodok angkor.com/',
    42,
  ])('opens the game folder rather than the url %j', (url) => {
    expect(toGameCard(apiGame({ url })).href).toBe('games/steel-and-dust/');
  });

  it('drops art that is not a plain relative URL', () => {
    const card = toGameCard(apiGame({ cover: 'javascript:alert(1)', banner: '//evil/x.png' }));
    expect(card.coverSrc).toBe('');
    expect(card.bannerSrc).toBe('');
  });
});

describe('firstSentence and metaLine', () => {
  it.each([
    ['One. Two.', 'One.'],
    ['Wait! More.', 'Wait!'],
    ['Version 1.5 is out. Yes.', 'Version 1.5 is out.'],
    ['  no stop at all ', 'no stop at all'],
    [undefined, ''],
  ])('takes the first sentence of %j', (text, expected) => {
    expect(firstSentence(text)).toBe(expected);
  });

  it('joins genre, players and year, skipping what is missing', () => {
    expect(metaLine({ genre: 'Puzzle', players: '2 players', year: 1991 })).toBe(
      'Puzzle · 2 players · 1991',
    );
    expect(metaLine({ genre: 'Puzzle', year: '1991' })).toBe('Puzzle');
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
