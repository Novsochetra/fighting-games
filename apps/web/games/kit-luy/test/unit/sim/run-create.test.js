import { describe, expect, it } from 'vitest';
import { STAGES } from '../../../src/data/stages.js';
import { TUNING } from '../../../src/data/tuning.js';
import { createRun, drainEvents } from '../../../src/sim/run.js';
import { playRecorded } from '../../support/bot.js';
import { ALL, newRun, serve } from './serving.js';

describe('createRun', () => {
  it('opens the stall with nothing taken and the clock standing still', () => {
    expect(newRun()).toMatchObject({
      ops: ALL,
      totalAlways: false,
      phase: 'serving',
      started: false,
      elapsed: 0,
      served: 0,
      takings: 0,
      streak: 0,
      bestStreak: 0,
      stage: 1,
      pieces: [500, 1000, 2000, 5000],
      showTotal: true,
      cloth: {},
      tries: 0,
      lockLeft: 0,
      missed: [],
    });
  });

  it('seats the first customer and sends the second walking up', () => {
    const run = newRun();
    const [first] = run.queue;
    const { customer, left, total } = run.arriving;

    expect(run.queue).toHaveLength(1);
    expect(first).toMatchObject({ id: 1, kind: 'shopper', question: TUNING.firstSum });
    expect(customer.id).toBe(2);
    expect([left, total]).toEqual([TUNING.firstArrivalMs, TUNING.firstArrivalMs]);
    expect(run.events).toEqual([
      { type: 'ask', customer: first },
      { type: 'approach', customer, ms: TUNING.firstArrivalMs },
    ]);
  });

  it('is plain data', () => {
    const run = newRun();

    expect(JSON.parse(JSON.stringify(run))).toEqual(run);
  });

  it('keeps its own till, apart from the stage table', () => {
    newRun().pieces.push(100);

    expect(STAGES[0].pieces).toEqual([500, 1000, 2000, 5000]);
  });

  it('shows the total past the second stage only when asked to always', () => {
    const plain = newRun();
    const always = newRun({ totalAlways: true });

    serve(plain, 18);
    serve(always, 18);

    expect([plain.stage, plain.showTotal]).toEqual([3, false]);
    expect([always.stage, always.showTotal]).toEqual([3, true]);
  });

  it('plays every sum when the mix names none it knows', () => {
    expect(createRun({ seed: 1, ops: [] }).ops).toEqual(ALL);
    expect(createRun({ seed: 1, ops: ['pow'] }).ops).toEqual(ALL);
    expect(createRun({ seed: 1, ops: 'add' }).ops).toEqual(ALL);
    expect(createRun({ seed: 1, ops: ['mul', 'sub', 'mul'] }).ops).toEqual(['sub', 'mul']);
  });

  it('opens on odd input instead of throwing', () => {
    expect(createRun().queue).toHaveLength(1);
    expect(createRun(null).phase).toBe('serving');
    expect(createRun({ seed: 'seven' }).queue[0].id).toBe(1);
  });
});

describe('drainEvents', () => {
  it('hands the events over and empties the list', () => {
    const run = newRun();
    const events = drainEvents(run);

    expect(events.map((event) => event.type)).toEqual(['ask', 'approach']);
    expect(run.events).toEqual([]);
    expect(drainEvents(run)).toEqual([]);
  });
});

describe('a seed', () => {
  const bot = { ops: ALL, thinkMs: 1800, tapMs: 400, missEvery: 7 };

  it('plays the same run again', () => {
    expect(playRecorded({ seed: 99, ...bot })).toEqual(playRecorded({ seed: 99, ...bot }));
  });

  it('plays another run from another seed', () => {
    expect(playRecorded({ seed: 99, ...bot }).asked).not.toEqual(
      playRecorded({ seed: 100, ...bot }).asked,
    );
  });
});
