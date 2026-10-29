import { DIFFICULTIES } from '../data/difficulty.js';
import { HEROES } from '../data/heroes.js';
import { MISSIONS } from '../data/missions/index.js';

const INITIALS = /^[A-Z]{3}$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const HERO_IDS = new Set(HEROES.map((hero) => hero.id));

const isWholeBetween = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;

function isOnlineRun(entry) {
  return (
    !!entry &&
    typeof entry.initials === 'string' &&
    INITIALS.test(entry.initials) &&
    isWholeBetween(entry.score, 1, Number.MAX_SAFE_INTEGER) &&
    isWholeBetween(entry.mission, 1, MISSIONS.length) &&
    isWholeBetween(entry.difficulty, 0, DIFFICULTIES.length - 1) &&
    isWholeBetween(entry.seconds, 0, Number.MAX_SAFE_INTEGER) &&
    HERO_IDS.has(entry.hero) &&
    typeof entry.date === 'string' &&
    DAY.test(entry.date)
  );
}

// the board's runs are written into the page, so only those made of what the game knows are kept;
// the time comes in seconds and is shown in the game's own ticks, as the device's board is
function shownRun({ initials, score, mission, hero, difficulty, seconds, cleared, date }) {
  return {
    initials,
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
