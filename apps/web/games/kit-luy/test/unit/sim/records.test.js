import { describe, expect, it } from 'vitest';
import { NO_RECORDS, recordRun, sanitizeRecords, summarize } from '../../../src/sim/records.js';

const missedBill = (answer) => ({
  question: { op: 'add', left: answer - 500, right: 500, answer },
  given: answer - 500,
  direction: 'short',
});

const finished = (fields = {}) => ({
  takings: 42000,
  served: 21,
  bestStreak: 9,
  stage: 3,
  missed: [missedBill(1000), missedBill(2000), missedBill(3000), missedBill(4000)],
  ...fields,
});

describe('records', () => {
  it('start at nothing', () => {
    expect(NO_RECORDS).toEqual({ best: 0, bestServed: 0, plays: 0 });
  });

  it('keep whole numbers of 0 or more as saved', () => {
    const saved = { best: 65500, bestServed: 31, plays: 4 };

    expect(sanitizeRecords(saved)).toEqual(saved);
    expect(sanitizeRecords(NO_RECORDS)).toEqual(NO_RECORDS);
  });

  it.each([-1, 2.5, '7', NaN, Infinity, null, undefined, [[]], {}, true])(
    'read a saved %s as 0',
    (odd) => {
      expect(sanitizeRecords({ best: odd, bestServed: odd, plays: odd })).toEqual(NO_RECORDS);
    },
  );

  it.each([undefined, null, 'records', 12, [[]]])('read a save of %s as no records', (saved) => {
    expect(sanitizeRecords(saved)).toEqual(NO_RECORDS);
  });

  it('drop what a save holds beside them', () => {
    expect(sanitizeRecords({ best: 500, savings: 9000, bestStreak: 4 })).toEqual({
      best: 500,
      bestServed: 0,
      plays: 0,
    });
  });

  it('count a run and keep the better takings and the longer day', () => {
    const records = { best: 50000, bestServed: 12, plays: 2 };

    expect(recordRun(records, finished())).toEqual({ best: 50000, bestServed: 21, plays: 3 });
    expect(recordRun(NO_RECORDS, finished())).toEqual({ best: 42000, bestServed: 21, plays: 1 });
    expect(records).toEqual({ best: 50000, bestServed: 12, plays: 2 });
  });
});

describe('summarize', () => {
  it('tells of the run, with the first three bills it got wrong', () => {
    const run = finished();

    expect(summarize(NO_RECORDS, run)).toEqual({
      takings: 42000,
      served: 21,
      bestStreak: 9,
      stage: 3,
      missed: run.missed.slice(0, 3),
      best: 42000,
      isNewBest: true,
    });
  });

  it('keeps the old best when the run falls short of it', () => {
    const summary = summarize({ best: 90000, bestServed: 40, plays: 7 }, finished());

    expect(summary.best).toBe(90000);
    expect(summary.isNewBest).toBe(false);
  });

  it('calls only takings above the old best a new best', () => {
    const records = { best: 42000, bestServed: 21, plays: 1 };

    expect(summarize(records, finished()).isNewBest).toBe(false);
    expect(summarize(records, finished({ takings: 42500 })).isNewBest).toBe(true);
  });

  it('calls a day with no takings no best at all', () => {
    const summary = summarize(NO_RECORDS, finished({ takings: 0, served: 0, missed: [] }));

    expect(summary).toMatchObject({ best: 0, isNewBest: false, missed: [] });
  });
});
