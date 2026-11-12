import { describe, expect, it } from 'vitest';
import { TUNING } from '../../../src/data/tuning.js';
import { advance, clearCloth, deal, drainEvents, give, takeBack } from '../../../src/sim/run.js';
import { dealAll, newRun, snapshot } from './serving.js';

function quietRun() {
  const run = newRun();

  drainEvents(run);

  return run;
}

function lockedRun() {
  const run = quietRun();

  deal(run, 500);
  give(run);
  drainEvents(run);

  return run;
}

describe('deal', () => {
  it('lays a piece on the cloth and says how many of it lie there', () => {
    const run = quietRun();

    deal(run, 500);
    deal(run, 2000);
    deal(run, 500);

    expect(run.cloth).toEqual({ 500: 2, 2000: 1 });
    expect(run.events).toEqual([
      { type: 'deal', value: 500, count: 1 },
      { type: 'deal', value: 2000, count: 1 },
      { type: 'deal', value: 500, count: 2 },
    ]);
  });

  it('deals only what the till holds', () => {
    const run = quietRun();

    for (const value of [10000, 100, 750, '500', undefined, NaN, -500]) {
      deal(run, value);
    }

    expect(run.cloth).toEqual({});
    expect(run.events).toEqual([]);
  });

  it('stops when the cloth is full', () => {
    const run = quietRun();

    dealAll(run, Array(TUNING.clothMost + 3).fill(500));

    expect(run.cloth).toEqual({ 500: TUNING.clothMost });
    expect(run.events).toHaveLength(TUNING.clothMost);
  });

  it('counts every value toward a full cloth', () => {
    const run = quietRun();

    dealAll(run, Array(TUNING.clothMost - 1).fill(500));
    deal(run, 1000);
    deal(run, 2000);

    expect(run.cloth).toEqual({ 500: TUNING.clothMost - 1, 1000: 1 });
  });

  it('deals nothing while the till is locked', () => {
    const run = lockedRun();
    const before = snapshot(run);

    deal(run, 500);

    expect(snapshot(run)).toBe(before);
  });
});

describe('takeBack', () => {
  it('takes one piece of a value back and says how many are left', () => {
    const run = quietRun();

    dealAll(run, [500, 500, 1000]);
    drainEvents(run);
    takeBack(run, 500);
    takeBack(run, 1000);

    expect(run.cloth).toEqual({ 500: 1 });
    expect(run.events).toEqual([
      { type: 'take', value: 500, count: 1 },
      { type: 'take', value: 1000, count: 0 },
    ]);
  });

  it('takes nothing back that does not lie there', () => {
    const run = quietRun();

    deal(run, 500);
    drainEvents(run);

    for (const value of [1000, 100, 'toString', undefined, NaN]) {
      takeBack(run, value);
    }

    expect(run.cloth).toEqual({ 500: 1 });
    expect(run.events).toEqual([]);
  });

  it('still takes a piece back while the till is locked, to fix a wrong give', () => {
    const run = lockedRun();

    takeBack(run, 500);

    expect(run.phase).toBe('locked');
    expect(run.cloth).toEqual({});
    expect(run.events).toEqual([{ type: 'take', value: 500, count: 0 }]);
  });
});

describe('clearCloth', () => {
  it('takes everything back', () => {
    const run = quietRun();

    dealAll(run, [500, 500, 5000]);
    drainEvents(run);
    clearCloth(run);

    expect(run.cloth).toEqual({});
    expect(run.events).toEqual([{ type: 'clear' }]);
  });

  it('says nothing when nothing lay there', () => {
    const run = quietRun();

    clearCloth(run);

    expect(run.events).toEqual([]);
  });

  it('clears a wrong give while the till is locked', () => {
    const run = lockedRun();

    clearCloth(run);
    advance(run, TUNING.wrongLockMs);

    expect(run.cloth).toEqual({});
    expect(run.phase).toBe('serving');
  });
});
