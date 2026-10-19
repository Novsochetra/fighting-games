import { toCatalogGame, validateGameEntry } from './game-entry.js';

export function buildCatalog(records, warn = () => {}) {
  const games = [];
  for (const record of records) {
    const problems = record.error ? [record.error] : validateGameEntry(record.entry, record.folder);
    if (problems.length > 0) {
      warn(`Skipping games/${record.folder}/game.json: ${problems.join('; ')}`);
    } else {
      games.push(toCatalogGame(record.entry));
    }
  }
  return { games: games.sort(compareGames) };
}

function compareGames(left, right) {
  return left.title.localeCompare(right.title, 'en') || left.id.localeCompare(right.id, 'en');
}

export function serializeCatalog(catalog) {
  return JSON.stringify(catalog);
}
