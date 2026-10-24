import { ULT_MAX } from '../config.js';
import { MISSIONS } from './missions/index.js';
import { START_LIVES } from './player.js';

const isAmount = (value) => Number.isFinite(value) && value >= 0;
const isWholeBetween = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;

function isPlayable({ mission, lives }) {
  return isWholeBetween(mission, 0, MISSIONS.length - 1) && isWholeBetween(lives, 1, START_LIVES);
}

function hasCarriedAmounts({ score, playTime, continues, ultMeter }) {
  return [score, playTime, continues, ultMeter].every(isAmount) && ultMeter <= ULT_MAX;
}

// a save from before the purse carries no coins, and keeps its run with an empty purse
function coinsOf({ coins }) {
  return coins === undefined ? 0 : coins;
}

// a save edited by hand, or broken, loads as no save at all rather than a broken run
export function sanitizeSavedRun(stored) {
  if (!stored || typeof stored !== 'object' || !isPlayable(stored) || !hasCarriedAmounts(stored)) {
    return null;
  }
  const coins = coinsOf(stored);
  if (!Number.isInteger(coins) || coins < 0) {
    return null;
  }
  const { mission, score, playTime, continues, lives, ultMeter } = stored;
  return { mission, score, coins, playTime, continues, lives, ultMeter };
}
