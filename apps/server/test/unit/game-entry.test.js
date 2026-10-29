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

  it.each([
    'assets/trailer/../../../trailer.mp4',
    'https://example.com/trailer.mp4',
    'assets/video/trailer.mp4',
    'trailer.mp4',
    'assets/trailer/trailer.webm',
    'assets/trailer/trailer.mp4.png',
    '',
    42,
  ])('rejects the trailer %j', (trailer) => {
    expect(validateGameEntry({ ...validEntry(), trailer }, 'demo-game')).toEqual([
      '"trailer" must be an .mp4 file in the game\'s assets/trailer/ folder',
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
