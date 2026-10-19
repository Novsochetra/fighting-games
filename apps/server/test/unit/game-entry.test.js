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

  it.each([['Keyboard', ''], 'Keyboard', [1]])('rejects controls %j', (controls) => {
    expect(validateGameEntry({ ...validEntry(), controls }, 'demo-game')).toEqual([
      '"controls" must be a list of non-empty strings',
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

  it('keeps the other catalog fields as they are', () => {
    const entry = { ...validEntry(), year: 2026 };
    const game = toCatalogGame(entry);
    expect(game).toMatchObject({ title: 'Demo Game', year: 2026, controls: ['Keyboard'] });
    expect(entry.cover).toBe('assets/cover.png');
  });
});
