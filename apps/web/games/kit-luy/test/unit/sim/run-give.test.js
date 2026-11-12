import { describe, expect, it } from 'vitest';
import { TUNING } from '../../../src/data/tuning.js';
import { arrivalMs } from '../../../src/sim/arrivals.js';
import { deal, drainEvents, give } from '../../../src/sim/run.js';
import {
  ask,
  dealAll,
  eventsOf,
  newRun,
  payFront,
  seat,
  serve,
  snapshot,
  startedRun,
  typesOf,
  waitForArrival,
} from './serving.js';

const lastPaid = (run) => eventsOf(run, 'paid').pop();

describe('give, with the right money', () => {
  it('pays the customer', () => {
    const run = newRun();
    const [customer] = run.queue;

    drainEvents(run);
    deal(run, 1000);
    give(run);

    expect(run).toMatchObject({ served: 1, started: true, streak: 1, bestStreak: 1, tries: 0 });
    expect(run.cloth).toEqual({});
    expect(run.takings).toBe(1500);
    expect(lastPaid(run)).toEqual({
      type: 'paid',
      customer,
      pieces: [1000],
      gain: 1500,
      clean: true,
      tip: true,
      extra: 0,
      streak: 1,
      served: 1,
    });
  });

  it('seats the one walking up at once when the row is empty, and asks them', () => {
    const run = newRun();
    const second = run.arriving.customer;

    drainEvents(run);
    payFront(run);

    expect(typesOf(run.events)).toEqual(['deal', 'paid', 'arrive', 'approach', 'ask']);
    expect(run.queue).toEqual([second]);
    expect(eventsOf(run, 'arrive')).toEqual([{ type: 'arrive', customer: second }]);
    expect(eventsOf(run, 'ask')).toEqual([{ type: 'ask', customer: second }]);
    expect(run.arriving).toMatchObject({ left: arrivalMs(1), total: arrivalMs(1) });
    expect(run.arriving.customer.id).toBe(3);
  });

  it('does nothing with an empty cloth', () => {
    const run = newRun();
    const before = snapshot(run);

    give(run);

    expect(snapshot(run)).toBe(before);
  });

  it('pays less for more pieces than the answer needs', () => {
    const run = newRun();

    dealAll(run, [500, 500]);
    give(run);

    expect(lastPaid(run)).toMatchObject({ clean: false, pieces: [500, 500], gain: 1000 });
  });

  it('calls the fewest pieces of the till clean, and lists them largest first', () => {
    const run = newRun();

    ask(run, { op: 'add', left: 2000, right: 1500, answer: 3500 });
    dealAll(run, [500, 2000, 1000]);
    give(run);

    expect(lastPaid(run)).toMatchObject({ clean: true, pieces: [2000, 1000, 500] });
  });

  it('tips for a bill nobody sat down during, the one seated at once included', () => {
    const run = startedRun();

    payFront(run);

    expect(lastPaid(run)).toMatchObject({ tip: true, gain: 500 + TUNING.cleanPay + TUNING.tipPay });
  });

  it('loses the tip when someone takes a stool while the bill is in front', () => {
    const run = startedRun();

    waitForArrival(run);
    payFront(run);

    expect(lastPaid(run)).toMatchObject({ tip: false, gain: 500 + TUNING.cleanPay });
  });

  it('starts the next bill with its tip whole', () => {
    const run = startedRun();

    waitForArrival(run);
    serve(run, 2);

    expect(lastPaid(run).tip).toBe(true);
  });

  it('adds an extra on every fifth right give in a row, growing to its most', () => {
    const run = newRun();

    serve(run, 30);

    const extras = eventsOf(run, 'paid').filter((paid) => paid.extra > 0);

    expect(extras.map((paid) => [paid.streak, paid.extra])).toEqual([
      [5, 1000],
      [10, 2000],
      [15, 3000],
      [20, 4000],
      [25, 5000],
      [30, 5000],
    ]);
    expect(extras[0].gain).toBe(500 + TUNING.cleanPay + TUNING.tipPay + 1000);
    expect(run.bestStreak).toBe(30);
  });

  it('sends the customer at the back next door with an extra', () => {
    const run = startedRun();

    seat(run, 2);
    run.streak = TUNING.streakPerExtra - 1;

    const [, next, back] = run.queue;

    payFront(run);

    expect(eventsOf(run, 'left')).toEqual([{ type: 'left', customer: back }]);
    expect(run.queue).toEqual([next]);
  });

  it('never sends the next to be served away', () => {
    const run = startedRun();

    seat(run, 1);
    run.streak = TUNING.streakPerExtra - 1;
    payFront(run);

    expect(lastPaid(run).extra).toBe(TUNING.extraPay);
    expect(eventsOf(run, 'left')).toEqual([]);
    expect(run.queue).toHaveLength(1);
  });

  it('sends nobody away without an extra', () => {
    const run = startedRun();

    seat(run, 3);
    payFront(run);

    expect(eventsOf(run, 'left')).toEqual([]);
    expect(run.queue).toHaveLength(3);
  });

  it('opens each stage in turn and adds its pieces to the till', () => {
    const run = newRun();

    serve(run, 44);

    expect(eventsOf(run, 'stage')).toEqual([
      { type: 'stage', stage: 2, added: [10000] },
      { type: 'stage', stage: 3, added: [100, 20000] },
      { type: 'stage', stage: 4, added: [50000] },
      { type: 'stage', stage: 5, added: [] },
    ]);
    expect(run.stage).toBe(5);
    expect(run.pieces).toEqual([100, 500, 1000, 2000, 5000, 10000, 20000, 50000]);
  });

  it('opens a stage with the payment that reaches it, and pays its pay from then on', () => {
    const run = newRun();

    serve(run, 7);
    expect([run.stage, run.pieces.includes(10000)]).toEqual([1, false]);

    payFront(run);
    expect([run.stage, run.pieces.includes(10000)]).toEqual([2, true]);
    expect(lastPaid(run).gain).toBe(500 + TUNING.cleanPay + TUNING.tipPay);

    payFront(run);
    expect(lastPaid(run).gain).toBe(1000 + TUNING.cleanPay + TUNING.tipPay);
  });

  it('tells of a payment in order: paid, who left, the stage, who is asked', () => {
    const run = startedRun();

    seat(run, 3);
    run.streak = TUNING.streakPerExtra - 1;
    run.served = 7;
    ask(run, { op: 'add', left: 500, right: 500, answer: 1000 });
    payFront(run);

    expect(typesOf(run.events)).toEqual(['deal', 'paid', 'left', 'stage', 'ask']);
    expect(eventsOf(run, 'ask')[0].customer).toBe(run.queue[0]);
  });
});
