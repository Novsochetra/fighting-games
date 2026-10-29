import { validateGameEntry } from '../catalog/game-entry.js';
import { readCatalogRecords } from '../catalog/read-catalog.js';

async function readBoardRules(gamesRoot) {
  const records = await readCatalogRecords(gamesRoot);
  const ruled = records.filter(
    ({ folder, entry, error }) =>
      !error && entry?.leaderboard && validateGameEntry(entry, folder).length === 0,
  );

  return new Map(ruled.map(({ entry }) => [entry.id, entry.leaderboard]));
}

// a game comes or goes only with a deploy, so the rules are read once, as the first board is asked
// for; a failed read is tried again next time
export function createBoardRules(gamesRoot) {
  let rules = null;

  return function rulesByGame() {
    rules ??= readBoardRules(gamesRoot).catch((error) => {
      rules = null;
      throw error;
    });

    return rules;
  };
}
