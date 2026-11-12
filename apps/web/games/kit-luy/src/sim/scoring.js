import { TUNING } from '../data/tuning.js';

export const levelOf = (correct) => 1 + Math.floor(correct / TUNING.answersPerLevel);

export const comboOf = (streak) =>
  Math.min(TUNING.maxCombo, 1 + Math.floor(streak / TUNING.streakPerCombo));

export const gainOf = ({ level, streak, fast }) =>
  level * TUNING.basePay * comboOf(streak) + (fast ? level * TUNING.fastPay : 0);

export const timeGainOf = (level) =>
  Math.max(TUNING.minTimeGainMs, TUNING.timeGainMs - TUNING.timeGainDropMs * (level - 1));

export function accuracyOf({ correct, wrong }) {
  const answered = correct + wrong;

  return answered === 0 ? 0 : Math.round((correct / answered) * 100);
}
