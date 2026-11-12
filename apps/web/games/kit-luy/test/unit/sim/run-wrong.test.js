import { describe, expect, it } from 'vitest';
import { TUNING } from '../../../src/data/tuning.js';
import { advance, deal, drainEvents, give, takeBack } from '../../../src/sim/run.js';
import { eventsOf, newRun, payFront, serve, snapshot, startedRun } from './serving.js';

const LOCK = TUNING.wrongLockMs;

function giveWrong(run, value) {
  deal(run, value);
  give(run);
}

function quietRun() {
  const run = newRun();

  drainEvents(run);

  return run;
}

describe('give, with the wrong money', () => {
  it('refuses too little, locks the till and leaves the cloth as it is', () => {
    const run = quietRun();
    const { question } = run.queue[0];

    giveWrong(run, 500);

    expect(run).toMatchObject({ phase: 'locked', lockLeft: LOCK, tries: 1, served: 0, takings: 0 });
    expect(run.started).toBe(false);
    expect(run.cloth).toEqual({ 500: 1 });
    expect(run.queue[0].question).toBe(question);
    expect(eventsOf(run, 'wrong')).toEqual([
      { type: 'wrong', direction: 'short', by: null, tries: 1 },
    ]);
  });

  it('refuses too much as over', () => {
    const run = quietRun();

    giveWrong(run, 2000);

    expect(eventsOf(run, 'wrong')).toEqual([
      { type: 'wrong', direction: 'over', by: null, tries: 1 },
    ]);
  });

  it('tells by how much from the second try on a bill', () => {
    const run = quietRun();

    giveWrong(run, 500);
    advance(run, LOCK);
    give(run);
    advance(run, LOCK);
    giveWrong(run, 2000);

    expect(eventsOf(run, 'wrong')).toEqual([
      { type: 'wrong', direction: 'short', by: null, tries: 1 },
      { type: 'wrong', direction: 'short', by: 500, tries: 2 },
      { type: 'wrong', direction: 'over', by: 1500, tries: 3 },
    ]);
    expect(run.tries).toBe(3);
  });

  it('pays once the cloth is put right, and starts the tries again', () => {
    const run = quietRun();

    giveWrong(run, 500);
    advance(run, LOCK);
    deal(run, 500);
    give(run);

    expect(run).toMatchObject({ served: 1, tries: 0, streak: 1, phase: 'serving' });

    giveWrong(run, run.queue[0].question.answer === 500 ? 1000 : 500);

    expect(eventsOf(run, 'wrong').pop()).toMatchObject({ by: null, tries: 1 });
  });

  it('notes a bill as missed the first time it is got wrong, and only then', () => {
    const run = quietRun();
    const { question } = run.queue[0];

    giveWrong(run, 2000);
    advance(run, LOCK);
    give(run);

    expect(run.missed).toEqual([{ question, given: 2000, direction: 'over' }]);
  });

  it('ends the streak and keeps the best', () => {
    const run = newRun();

    serve(run, 4);
    giveWrong(run, run.queue[0].question.answer === 500 ? 1000 : 500);
    advance(run, LOCK);
    takeBack(run, 500);
    takeBack(run, 1000);
    serve(run, 4);

    expect([run.streak, run.bestStreak]).toEqual([4, 4]);
    expect(eventsOf(run, 'paid').every((paid) => paid.extra === 0)).toBe(true);
  });
});

describe('the lock', () => {
  it('counts down and opens the till again', () => {
    const run = quietRun();

    giveWrong(run, 500);
    drainEvents(run);
    advance(run, LOCK - 1);

    expect(run).toMatchObject({ phase: 'locked', lockLeft: 1 });
    expect(run.events).toEqual([]);

    advance(run, 1);

    expect(run).toMatchObject({ phase: 'serving', lockLeft: 0 });
    expect(run.events).toEqual([{ type: 'unlock' }]);
  });

  it('opens before the first customer is paid, though the clock stands still', () => {
    const run = quietRun();

    giveWrong(run, 500);
    advance(run, LOCK * 4);

    expect(run).toMatchObject({ phase: 'serving', started: false, elapsed: 0 });
    expect(run.arriving.left).toBe(TUNING.firstArrivalMs);
  });

  it('takes no give', () => {
    const run = quietRun();

    giveWrong(run, 500);

    const before = snapshot(run);

    give(run);

    expect(snapshot(run)).toBe(before);
  });

  it('holds the clock and whoever is walking up', () => {
    const run = startedRun();
    const { left } = run.arriving;

    giveWrong(run, run.queue[0].question.answer === 500 ? 1000 : 500);
    advance(run, LOCK - 100);

    expect(run.elapsed).toBe(0);
    expect(run.arriving.left).toBe(left);
  });

  it('gives what a step has left after it to the clock', () => {
    const run = startedRun();
    const { left } = run.arriving;

    giveWrong(run, run.queue[0].question.answer === 500 ? 1000 : 500);
    advance(run, LOCK + 250);

    expect(run.phase).toBe('serving');
    expect(run.elapsed).toBe(250);
    expect(run.arriving.left).toBe(left - 250);
  });

  it('lets the bill be paid once it is over', () => {
    const run = startedRun();

    giveWrong(run, run.queue[0].question.answer === 500 ? 1000 : 500);
    advance(run, LOCK);
    takeBack(run, 500);
    takeBack(run, 1000);
    payFront(run);

    expect(run.served).toBe(2);
  });
});
