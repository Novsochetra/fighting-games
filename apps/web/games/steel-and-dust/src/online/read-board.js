import { DIFFICULTIES } from '../data/difficulty.js';
import { HEROES } from '../data/heroes.js';
import { MISSIONS } from '../data/missions/index.js';

// the server cleaned and checked each name; one that comes otherwise is no run the server sent
const NAME = /^[^\p{Cc}]{1,40}$/u;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const HERO_IDS = new Set(HEROES.map((hero) => hero.id));

const isWholeBetween = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;

function isOnlineRun(entry) {
  return (
    !!entry &&
    typeof entry.name === 'string' &&
    NAME.test(entry.name) &&
    isWholeBetween(entry.score, 1, Number.MAX_SAFE_INTEGER) &&
    isWholeBetween(entry.mission, 1, MISSIONS.length) &&
    isWholeBetween(entry.difficulty, 0, DIFFICULTIES.length - 1) &&
    isWholeBetween(entry.seconds, 0, Number.MAX_SAFE_INTEGER) &&
    HERO_IDS.has(entry.hero) &&
    typeof entry.date === 'string' &&
    DAY.test(entry.date)
  );
}

// the board's runs are written into the page, so only those made of what the game knows are kept,
// and each name is escaped as it is written; the time comes in seconds and is shown in the game's
// own ticks, as the device's board is
function shownRun({ name, score, mission, hero, difficulty, seconds, cleared, date }) {
  return {
    name,
    score,
    mission,
    hero,
    difficulty,
    time: seconds * 60,
    cleared: !!cleared,
    date,
  };
}

const readRuns = (runs) => (Array.isArray(runs) ? runs.filter(isOnlineRun).map(shownRun) : []);

export function readBoard(json) {
  return { week: readRuns(json?.week), allTime: readRuns(json?.allTime) };
}
