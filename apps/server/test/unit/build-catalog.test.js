import { describe, expect, it, vi } from 'vitest';
import { buildCatalog, serializeCatalog } from '../../src/catalog/build-catalog.js';

const entryFor = (id, title) => ({
  id,
  title,
  tagline: 'Tagline',
  description: 'Description',
  genre: 'Genre',
  players: '1 player',
  cover: 'cover.png',
});

describe('buildCatalog', () => {
  it('shapes valid entries and sorts them by title', () => {
    const records = [
      { folder: 'zeta', entry: entryFor('zeta', 'Zeta Strike') },
      { folder: 'alpha', entry: entryFor('alpha', 'alpha Run') },
      { folder: 'mid', entry: entryFor('mid', 'Mid Night') },
    ];
    const { games } = buildCatalog(records);
    expect(games.map((game) => game.id)).toEqual(['alpha', 'mid', 'zeta']);
    expect(games[0]).toMatchObject({ path: 'games/alpha/', cover: 'games/alpha/cover.png' });
  });

  it('breaks title ties by id so the order is stable', () => {
    const records = [
      { folder: 'b-side', entry: entryFor('b-side', 'Same') },
      { folder: 'a-side', entry: entryFor('a-side', 'Same') },
    ];
    expect(buildCatalog(records).games.map((game) => game.id)).toEqual(['a-side', 'b-side']);
  });

  it('skips invalid entries and unreadable files with one warning each', () => {
    const warn = vi.fn();
    const records = [
      { folder: 'good', entry: entryFor('good', 'Good') },
      { folder: 'renamed', entry: entryFor('old-name', 'Renamed') },
      { folder: 'broken', error: 'the file is not valid JSON (Unexpected token)' },
    ];
    const { games } = buildCatalog(records, warn);
    expect(games.map((game) => game.id)).toEqual(['good']);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledWith(
      'Skipping games/renamed/game.json: "id" is "old-name" but the folder is "renamed"',
    );
    expect(warn).toHaveBeenCalledWith(
      'Skipping games/broken/game.json: the file is not valid JSON (Unexpected token)',
    );
  });

  it('returns an empty list when there are no games', () => {
    expect(buildCatalog([])).toEqual({ games: [] });
  });
});

describe('serializeCatalog', () => {
  it('writes the catalog as JSON that parses back to the same value', () => {
    const catalog = buildCatalog([{ folder: 'one', entry: entryFor('one', 'One & Only') }]);
    expect(JSON.parse(serializeCatalog(catalog))).toEqual(catalog);
  });
});
