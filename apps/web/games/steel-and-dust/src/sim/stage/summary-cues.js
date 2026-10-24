import {
  rowStartsAt,
  stepCount,
  stepNow,
  SUMMARY,
  SUMMARY_KINDS,
  SUMMARY_TICKS,
  summaryValues,
  TOTAL_ROW,
} from '../../data/mission-summary.js';
import { streakRate } from '../items/loot-collect.js';

const ARRIVE_SOUND = { coin: 'coin', gem: 'gem', apple: 'appleBite' };
// a kind the hero took none of comes in with a dull low clink
const NONE_RATE = 0.7;

// each kind comes in with the sound of taking it, and its count ticks up the coin run's scale
function cueKind(game, { kind, value, since }) {
  if (since === 0) {
    const key = value ? ARRIVE_SOUND[kind] : 'clink';
    game.io.sfx(key, false, value ? {} : { rate: NONE_RATE });
  }
  const step = stepNow(value, since);
  if (step >= 0) {
    game.io.sfx('clink', false, { rate: streakRate(step) });
  }
}

// the take rolls up in coins climbing the scale and lands on a chord
function cueTake(game, { value, since }) {
  const step = stepNow(value, since);
  if (step < 0) {
    return;
  }
  game.io.sfx('coin', false, { rate: streakRate(step) });
  if (step === stepCount(value) - 1) {
    game.io.sfx('tallyTotal');
  }
}

// the sounds keep time with the summary the clear draws (data/mission-summary.js), tick for tick
export function cueSummary(game) {
  const time = game.clearTime;
  if (!time || time > SUMMARY_TICKS) {
    return;
  }
  if (time === SUMMARY.openAt) {
    game.io.sfx('tallyOpen');
  }
  summaryValues(game.missionLoot).forEach((value, row) => {
    const since = time - rowStartsAt(row);
    if (row === TOTAL_ROW) {
      cueTake(game, { value, since });
    } else {
      cueKind(game, { kind: SUMMARY_KINDS[row], value, since });
    }
  });
}
