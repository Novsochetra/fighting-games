import { describe, expect, it } from 'vitest';
import { NO_RECORDS, recordRun, sanitizeRecords, summarize } from '../../../src/sim/records.js';

const run = (fields) => ({ score: 0, correct: 0, wrong: 0, bestStreak: 0, level: 1, ...fields });

describe('records', () => {
  it('keeps the best score and streak, and saves every run’s earnings', () => {
    const records = { best: 5000, bestStreak: 9, savings: 20000, plays: 3 };

    expect(recordRun(records, run({ score: 3000, bestStreak: 12 }))).toEqual({
      best: 5000,
      bestStreak: 12,
      savings: 23000,
      plays: 4,
    });
  });

  it('calls a run a new best only when it beats the old one', () => {
    const records = { ...NO_RECORDS, best: 5000 };

    expect(summarize(records, run({ score: 5000 })).isNewBest).toBe(false);
    expect(summarize(records, run({ score: 5100 }))).toMatchObject({ isNewBest: true, best: 5100 });
  });

  it('says when a run’s earnings reached the next rank', () => {
    const records = { ...NO_RECORDS, savings: 9000 };

    expect(summarize(records, run({ score: 900 })).rankUp).toBe(false);
    expect(summarize(records, run({ score: 1000 }))).toMatchObject({
      rankUp: true,
      savings: 10000,
    });
  });

  it('tells a run’s numbers', () => {
    const told = summarize(NO_RECORDS, run({ score: 2000, correct: 7, wrong: 6, bestStreak: 7 }));

    expect(told).toMatchObject({ score: 2000, correct: 7, accuracy: 54, bestStreak: 7, level: 1 });
  });

  it.each([null, 'x', [], { best: -4, savings: 'lots', plays: NaN }])(
    'reads broken saved records (%j) as none',
    (saved) => {
      expect(sanitizeRecords(saved)).toEqual(NO_RECORDS);
    },
  );

  it('reads saved records back whole', () => {
    expect(sanitizeRecords({ best: 4200.9, bestStreak: 8, savings: 90000, plays: 12 })).toEqual({
      best: 4200,
      bestStreak: 8,
      savings: 90000,
      plays: 12,
    });
  });
});
