import { TUNING } from '../data/tuning.js';

export const NO_RECORDS = { best: 0, bestServed: 0, plays: 0 };

const count = (value) => (Number.isSafeInteger(value) && value > 0 ? value : 0);

export function sanitizeRecords(saved) {
  const from = saved && typeof saved === 'object' ? saved : {};

  return {
    best: count(from.best),
    bestServed: count(from.bestServed),
    plays: count(from.plays),
  };
}

export function recordRun(records, run) {
  return {
    best: Math.max(records.best, run.takings),
    bestServed: Math.max(records.bestServed, run.served),
    plays: records.plays + 1,
  };
}

// what the results screen tells of a run, against the records as they stood before it
export function summarize(records, run) {
  return {
    takings: run.takings,
    served: run.served,
    bestStreak: run.bestStreak,
    stage: run.stage,
    missed: run.missed.slice(0, TUNING.missedShown),
    best: recordRun(records, run).best,
    isNewBest: run.takings > records.best && run.takings > 0,
  };
}
