import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { STAGES } from '../../../src/data/stages.js';
import { TUNING } from '../../../src/data/tuning.js';
import { arrivalMs } from '../../../src/sim/arrivals.js';
import { advance, clearCloth, deal, give, takeBack } from '../../../src/sim/run.js';
import {
  eventsOf,
  newRun,
  payFront,
  serve,
  snapshot,
  startedRun,
  typesOf,
  waitForArrival,
} from './serving.js';

// these days are about the stools alone: nobody in them ever tires of waiting
const patienceOf = STAGES.map((stage) => stage.patience);

beforeEach(() => {
  STAGES.forEach((stage) => {
    stage.patience = Infinity;
  });
});

afterEach(() => {
  STAGES.forEach((stage, i) => {
    stage.patience = patienceOf[i];
  });
});

function closedRun() {
  const run = startedRun();

  deal(run, 500);

  while (run.phase !== 'closed') {
    advance(run, 100);
  }

  return run;
}

describe('the clock', () => {
  it('stands still until the first customer is paid', () => {
    const run = newRun();
    const before = snapshot(run);

    advance(run, 60000);

    expect(snapshot(run)).toBe(before);
  });

  it('runs once they are, and brings the next customer nearer', () => {
    const run = startedRun();
    const { total } = run.arriving;

    advance(run, 16);
    advance(run, 1000);

    expect(run.elapsed).toBe(1016);
    expect(run.arriving).toMatchObject({ left: total - 1016, total });
    expect(run.events).toEqual([]);
  });

  it.each([0, -16, NaN, Infinity, undefined, '16'])('does not move for a step of %s', (ms) => {
    const run = startedRun();
    const before = snapshot(run);

    advance(run, ms);

    expect(snapshot(run)).toBe(before);
  });
});

describe('arrivals', () => {
  it('come faster with every customer served, down to a floor', () => {
    expect(arrivalMs(0)).toBe(TUNING.firstArrivalMs);
    expect(arrivalMs(1)).toBe(TUNING.firstArrivalMs - TUNING.arrivalDropMs);
    expect(arrivalMs(20)).toBe(TUNING.firstArrivalMs - 20 * TUNING.arrivalDropMs);
    expect(arrivalMs(500)).toBe(TUNING.minArrivalMs);
    expect(TUNING.minArrivalMs).toBeLessThan(TUNING.firstArrivalMs);
  });

  it('take a stool at the back when the walk is over', () => {
    const run = startedRun();
    const walker = run.arriving.customer;

    advance(run, run.arriving.left - 1);
    expect(run.queue).toHaveLength(1);

    advance(run, 1);

    expect(run.queue[1]).toBe(walker);
    expect(typesOf(run.events)).toEqual(['arrive', 'approach']);
    expect(run.events[0]).toEqual({ type: 'arrive', customer: walker });
  });

  it('send the next one walking, for as long as the customers served make it', () => {
    const run = startedRun();

    serve(run, 9);
    waitForArrival(run);

    const { customer, ms } = eventsOf(run, 'approach').pop();

    expect(ms).toBe(arrivalMs(10));
    expect(run.arriving).toEqual({ customer, left: ms, total: ms });
  });

  it('seat everyone a long step brought', () => {
    const run = startedRun();
    const walk = arrivalMs(1);

    advance(run, walk * 3 + 500);

    expect(run.queue).toHaveLength(4);
    expect(run.arriving.left).toBe(walk - 500);
    expect(run.elapsed).toBe(walk * 3 + 500);
  });

  it('fill the row and no more', () => {
    const run = startedRun();

    advance(run, arrivalMs(1) * (TUNING.seats - 1));

    expect(run.queue).toHaveLength(TUNING.seats);
    expect(run.phase).toBe('serving');
  });
});

describe('closing', () => {
  it('comes when a customer arrives and every stool is taken', () => {
    const run = startedRun();

    advance(run, arrivalMs(1) * (TUNING.seats - 1));

    const walker = run.arriving.customer;

    waitForArrival(run);

    expect(run.phase).toBe('closed');
    expect(run.queue).toHaveLength(TUNING.seats);
    expect(run.queue).not.toContain(walker);
    expect(run.events.pop()).toEqual({ type: 'closed', customer: walker, reason: 'stools' });
    expect(eventsOf(run, 'closed')).toEqual([]);
  });

  it('is put off by paying a customer in time', () => {
    const run = startedRun();

    advance(run, arrivalMs(1) * (TUNING.seats - 1));
    payFront(run);
    waitForArrival(run);

    expect(run.phase).toBe('serving');
    expect(run.queue).toHaveLength(TUNING.seats);
  });

  it('is for good: nothing changes after it', () => {
    const run = closedRun();
    const before = snapshot(run);

    deal(run, 500);
    takeBack(run, 500);
    clearCloth(run);
    give(run);
    payFront(run);
    advance(run, 16);
    advance(run, 600000);

    expect(snapshot(run)).toBe(before);
    expect(run.cloth).toEqual({ 500: 1 });
  });

  it('keeps the day as it stood', () => {
    const run = closedRun();

    expect(run).toMatchObject({ served: 1, takings: 2000, stage: 1 });
    expect(run.elapsed).toBe(arrivalMs(1) * TUNING.seats);
  });
});
