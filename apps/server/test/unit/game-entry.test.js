import { describe, expect, it } from 'vitest';
import { toCatalogGame, validateGameEntry } from '../../src/catalog/game-entry.js';

const validEntry = () => ({
  id: 'demo-game',
  title: 'Demo Game',
  tagline: 'A test cartridge',
  description: 'Used by the tests.',
  genre: 'Puzzle',
  players: '1 player',
  controls: ['Keyboard'],
  cover: 'assets/cover.png',
});

describe('validateGameEntry', () => {
  it('accepts a complete entry whose id matches its folder', () => {
    expect(validateGameEntry(validEntry(), 'demo-game')).toEqual([]);
  });

  it('accepts an entry without the optional controls list', () => {
    const entry = validEntry();
    delete entry.controls;
    expect(validateGameEntry(entry, 'demo-game')).toEqual([]);
  });

  it.each([null, [], 'game', 42])('rejects %j, which is not an object', (entry) => {
    expect(validateGameEntry(entry, 'demo-game')).toEqual(['game.json must hold a JSON object']);
  });

  it.each(['id', 'title', 'tagline', 'description', 'genre', 'players', 'cover'])(
    'reports a missing or blank "%s"',
    (field) => {
      const missing = { ...validEntry(), [field]: undefined };
      const blank = { ...validEntry(), [field]: '   ' };
      const expected = `"${field}" must be a non-empty string`;
      expect(validateGameEntry(missing, 'demo-game')).toContain(expected);
      expect(validateGameEntry(blank, 'demo-game')).toContain(expected);
    },
  );

  it('rejects an id that differs from the folder name', () => {
    expect(validateGameEntry(validEntry(), 'other-folder')).toEqual([
      '"id" is "demo-game" but the folder is "other-folder"',
    ]);
  });

  it('rejects an id that is not a lowercase slug, even when it matches the folder', () => {
    const entry = { ...validEntry(), id: 'Demo Game' };
    expect(validateGameEntry(entry, 'Demo Game')).toEqual([
      '"id" may only use lowercase letters, digits and dashes',
    ]);
  });

  it.each([
    '../secret.png',
    'assets/../../package.json',
    '/etc/passwd',
    'https://example.com/cover.png',
    'assets\\cover.png',
    '.hidden/cover.png',
    'assets//cover.png',
    'cover.png?x=1',
  ])('rejects the cover path %j', (cover) => {
    expect(validateGameEntry({ ...validEntry(), cover }, 'demo-game')).toEqual([
      '"cover" must be a relative file path inside the game folder',
    ]);
  });

  it('accepts a banner and a poster inside the game folder', () => {
    const entry = { ...validEntry(), banner: 'assets/banner.png', poster: 'assets/poster.png' };
    expect(validateGameEntry(entry, 'demo-game')).toEqual([]);
  });

  it('accepts a screenshot inside the game folder', () => {
    const entry = { ...validEntry(), screenshot: 'assets/screenshots/play.png' };
    expect(validateGameEntry(entry, 'demo-game')).toEqual([]);
  });

  it.each(['banner', 'poster', 'screenshot'])(
    'rejects a %s outside the game folder or not a path',
    (field) => {
      for (const value of ['../banner.png', 'https://example.com/a.png', '', 42]) {
        expect(validateGameEntry({ ...validEntry(), [field]: value }, 'demo-game')).toEqual([
          `"${field}" must be a relative file path inside the game folder`,
        ]);
      }
    },
  );

  it('accepts a trailer, a video of play inside the game folder', () => {
    const entry = { ...validEntry(), trailer: 'assets/trailer/trailer.mp4' };
    expect(validateGameEntry(entry, 'demo-game')).toEqual([]);
  });

  it('accepts a trailer on a CDN, with a smaller copy for phones', () => {
    const entry = {
      ...validEntry(),
      trailer: 'https://cdn.example.com/promo/demo-trailer.mp4',
      trailerSmall: 'https://cdn.example.com/promo/demo-trailer-480.mp4',
    };
    expect(validateGameEntry(entry, 'demo-game')).toEqual([]);
  });

  it.each([
    'assets/trailer/../../../trailer.mp4',
    'http://cdn.example.com/trailer.mp4',
    'https://user:secret@cdn.example.com/trailer.mp4',
    'https://cdn.example.com/trailer.webm',
    'https://cdn.example.com/trailer.mp4.html',
    'javascript:alert(1)//.mp4',
    '//cdn.example.com/trailer.mp4',
    'assets/video/trailer.mp4',
    'trailer.mp4',
    'assets/trailer/trailer.webm',
    'assets/trailer/trailer.mp4.png',
    '',
    42,
  ])('rejects the trailer %j', (trailer) => {
    expect(validateGameEntry({ ...validEntry(), trailer }, 'demo-game')).toEqual([
      '"trailer" must be an .mp4 in the game\'s assets/trailer/ folder or at an https:// address',
    ]);
  });

  it('rejects a small copy of a trailer the game does not have', () => {
    const entry = { ...validEntry(), trailerSmall: 'https://cdn.example.com/trailer-480.mp4' };
    expect(validateGameEntry(entry, 'demo-game')).toEqual([
      '"trailerSmall" needs the "trailer" it is a smaller copy of',
    ]);
  });

  it.each([['Keyboard', ''], 'Keyboard', [1]])('rejects controls %j', (controls) => {
    expect(validateGameEntry({ ...validEntry(), controls }, 'demo-game')).toEqual([
      '"controls" must be a list of non-empty strings',
    ]);
  });

  it('accepts a game hosted on its own secure site, with smooth art', () => {
    const entry = { ...validEntry(), url: 'https://morodokangkor.com/', pixelArt: false };
    expect(validateGameEntry(entry, 'demo-game')).toEqual([]);
  });

  it.each([
    'http://morodokangkor.com/',
    'javascript:alert(1)',
    '//morodokangkor.com/',
    'games/demo-game/',
    'https://user:secret@morodokangkor.com/',
    'https://morodok angkor.com/',
    '',
    42,
  ])('rejects the url %j', (url) => {
    expect(validateGameEntry({ ...validEntry(), url }, 'demo-game')).toEqual([
      '"url" must be an https:// address',
    ]);
  });

  it.each(['false', 0, null])('rejects pixelArt %j', (pixelArt) => {
    expect(validateGameEntry({ ...validEntry(), pixelArt }, 'demo-game')).toEqual([
      '"pixelArt" must be true or false',
    ]);
  });

  it('reports every problem at once', () => {
    const entry = { id: 'demo-game', cover: '../x.png' };
    expect(validateGameEntry(entry, 'demo-game')).toHaveLength(6);
  });
});

describe('the leaderboard rules', () => {
  const rules = (extra) => ({
    heroes: [
      { id: 'moss', name: 'Moss Shade' },
      { id: 'bokator', name: 'Bokator' },
    ],
    missions: 12,
    difficulties: ['Easy', 'Normal', 'Hard'],
    maxPointsPerSecond: 1000,
    ...extra,
  });
  const check = (leaderboard) => validateGameEntry({ ...validEntry(), leaderboard }, 'demo-game');

  it('accepts a game that names its heroes, missions, difficulties and scoring pace', () => {
    expect(check(rules())).toEqual([]);
  });

  it.each([
    ['not an object', ['moss'], /must be an object/],
    ['no heroes', rules({ heroes: [] }), /heroes/],
    [
      'a hero listed twice',
      rules({
        heroes: [
          { id: 'moss', name: 'A' },
          { id: 'moss', name: 'B' },
        ],
      }),
      /heroes/,
    ],
    ['a hero id with spaces', rules({ heroes: [{ id: 'moss shade', name: 'Moss' }] }), /heroes/],
    ['a hero with no name', rules({ heroes: [{ id: 'moss', name: ' ' }] }), /heroes/],
    ['heroes as bare ids', rules({ heroes: ['moss'] }), /heroes/],
    ['no missions', rules({ missions: 0 }), /missions/],
    ['part of a mission', rules({ missions: 1.5 }), /missions/],
    ['ten difficulties', rules({ difficulties: Array(10).fill('Hard') }), /difficulties/],
    ['difficulties as a count', rules({ difficulties: 3 }), /difficulties/],
    ['no scoring pace', rules({ maxPointsPerSecond: 0 }), /maxPointsPerSecond/],
    ['a scoring pace as text', rules({ maxPointsPerSecond: '1000' }), /maxPointsPerSecond/],
  ])('rejects rules with %s', (_label, leaderboard, problem) => {
    expect(check(leaderboard)).toEqual([expect.stringMatching(problem)]);
  });

  it('hands the arcade the heroes, missions and difficulties, but not the scoring pace', () => {
    const { leaderboard } = toCatalogGame({ ...validEntry(), leaderboard: rules() });
    expect(leaderboard).toEqual({
      heroes: [
        { id: 'moss', name: 'Moss Shade' },
        { id: 'bokator', name: 'Bokator' },
      ],
      missions: 12,
      difficulties: ['Easy', 'Normal', 'Hard'],
    });
    expect(toCatalogGame(validEntry())).not.toHaveProperty('leaderboard');
  });
});

describe('toCatalogGame', () => {
  it('adds the game path and resolves the cover relative to the site root', () => {
    const game = toCatalogGame(validEntry());
    expect(game.path).toBe('games/demo-game/');
    expect(game.cover).toBe('games/demo-game/assets/cover.png');
  });

  it('resolves the banner and poster like the cover, and adds neither when missing', () => {
    const game = toCatalogGame({ ...validEntry(), banner: 'art/wide.png', poster: 'art/tall.png' });
    expect(game.banner).toBe('games/demo-game/art/wide.png');
    expect(game.poster).toBe('games/demo-game/art/tall.png');
    expect(toCatalogGame(validEntry())).not.toHaveProperty('banner');
    expect(toCatalogGame(validEntry())).not.toHaveProperty('poster');
    const shot = toCatalogGame({ ...validEntry(), screenshot: 'shots/a.png' });
    expect(shot.screenshot).toBe('games/demo-game/shots/a.png');
  });

  it('resolves a trailer like the art, and adds none when missing', () => {
    const game = toCatalogGame({ ...validEntry(), trailer: 'assets/trailer/trailer.mp4' });
    expect(game.trailer).toBe('games/demo-game/assets/trailer/trailer.mp4');
    expect(toCatalogGame(validEntry())).not.toHaveProperty('trailer');
    expect(toCatalogGame(validEntry())).not.toHaveProperty('trailerSmall');
  });

  it('keeps a trailer on a CDN, and its small copy, where they are', () => {
    const trailer = 'https://cdn.example.com/promo/demo-trailer.mp4';
    const trailerSmall = 'https://cdn.example.com/promo/demo-trailer-480.mp4';
    const game = toCatalogGame({ ...validEntry(), trailer, trailerSmall });
    expect(game).toMatchObject({ trailer, trailerSmall });
  });

  it('keeps the folder path of a game hosted elsewhere, next to its url', () => {
    const game = toCatalogGame({ ...validEntry(), url: 'https://morodokangkor.com/' });
    expect(game.path).toBe('games/demo-game/');
    expect(game.url).toBe('https://morodokangkor.com/');
  });

  it('keeps the other catalog fields as they are', () => {
    const entry = { ...validEntry(), year: 2026 };
    const game = toCatalogGame(entry);
    expect(game).toMatchObject({ title: 'Demo Game', year: 2026, controls: ['Keyboard'] });
    expect(entry.cover).toBe('assets/cover.png');
  });
});
