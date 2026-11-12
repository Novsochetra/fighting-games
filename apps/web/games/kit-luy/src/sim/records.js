import { rankOf } from './rank.js';
import { accuracyOf } from './scoring.js';

export const NO_RECORDS = { best: 0, bestStreak: 0, savings: 0, plays: 0 };

const count = (value) => (Number.isFinite(value) && value > 0 ? Math.floor(value) : 0);

export function sanitizeRecords(saved) {
  const from = saved && typeof saved === 'object' ? saved : {};

  return {
    best: count(from.best),
    bestStreak: count(from.bestStreak),
    savings: count(from.savings),
    plays: count(from.plays),
  };
}

export function recordRun(records, run) {
  return {
    best: Math.max(records.best, run.score),
    bestStreak: Math.max(records.bestStreak, run.bestStreak),
    savings: records.savings + run.score,
    plays: records.plays + 1,
  };
}

// what the results screen tells of a run, against the records as they stood before it
export function summarize(records, run) {
  const after = recordRun(records, run);

  return {
    score: run.score,
    correct: run.correct,
    accuracy: accuracyOf(run),
    bestStreak: run.bestStreak,
    level: run.level,
    best: after.best,
    savings: after.savings,
    isNewBest: run.score > records.best,
    rankUp: rankOf(after.savings) !== rankOf(records.savings),
  };
}
