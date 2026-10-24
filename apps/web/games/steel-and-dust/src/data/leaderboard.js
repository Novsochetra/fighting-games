import { DIFFICULTIES } from './difficulty.js';
import { MISSIONS } from './missions/index.js';

export const LEADERBOARD_SIZE = 10;

// a run that ties a score already on the board ranks under it: the earlier run got there first
export function rankRun(board, entry) {
  const at = board.findIndex((ranked) => ranked.score < entry.score);
  const ranked = at < 0 ? [...board, entry] : [...board.slice(0, at), entry, ...board.slice(at)];
  return ranked.slice(0, LEADERBOARD_SIZE);
}

// 1 for the top of the board, 0 for a run that did not make it
export function rankOf(board, entry) {
  return entry ? board.indexOf(entry) + 1 : 0;
}

const isAmount = (value) => Number.isFinite(value) && value >= 0;
const isIndex = (value, list) => Number.isInteger(value) && value >= 0 && value < list.length;

function isEntry(entry) {
  return (
    !!entry &&
    isAmount(entry.score) &&
    entry.score > 0 &&
    isIndex(entry.mission - 1, MISSIONS) &&
    isIndex(entry.difficulty, DIFFICULTIES) &&
    typeof entry.hero === 'string' &&
    [entry.time, entry.at].every(isAmount)
  );
}

function storedEntry({ score, mission, hero, difficulty, time, cleared, at }) {
  return { score, mission, hero, difficulty, time, cleared: cleared === true, at };
}

// a board from an older game, or edited by hand, keeps only the runs it can show, best first
export function sanitizeLeaderboard(stored) {
  if (!Array.isArray(stored)) {
    return [];
  }
  return stored
    .filter(isEntry)
    .map(storedEntry)
    .reduce((board, entry) => rankRun(board, entry), []);
}
