import { describe, expect, it } from 'vitest';
import { STAGES } from '../../../src/data/stages.js';
import { TUNING } from '../../../src/data/tuning.js';
import { advance, deal, drainEvents, give } from '../../../src/sim/run.js';
import { eventsOf, newRun, payFront, startedRun, typesOf } from './serving.js';

const waitOut = (run) => advance(run, run.patience.left);

describe('a customer’s patience', () => {
  it('is whole for the first bill, and stands still on the title', () => {
    const run = newRun();

    advance(run, 60000);

    expect(run.patience).toEqual({ left: STAGES[0].patience, total: STAGES[0].patience });
  });

  it('runs down once the day has started, through a lock too', () => {
    const run = startedRun();
    const wrong = run.queue[0].question.answer === 500 ? 1000 : 500;

    deal(run, wrong);
    give(run);
    advance(run, 400);

    expect(run.phase).toBe('locked');
    expect(run.patience.left).toBe(STAGES[0].patience - 400);
  });

  it('grows with the stages', () => {
    const lengths = STAGES.map((stage) => stage.patience);

    expect([...lengths].sort((left, right) => left - right)).toEqual(lengths);
  });
});

describe('a customer who has waited all they will', () => {
  it('storms off unpaid, and the next customer is asked with their whole patience', () => {
    const run = startedRun();
    const [gone, next] = [run.queue[0], run.arriving.customer];

    deal(run, 500);
    waitOut(run);

    expect(eventsOf(run, 'stormed')).toEqual([{ type: 'stormed', customer: gone, strikes: 1 }]);
    expect(run.queue[0]).toBe(next);
    expect(run).toMatchObject({ strikes: 1, streak: 0, cloth: {}, served: 1, takings: 2000 });
    expect(run.patience.left).toBe(run.patience.total);
    expect(run.missed.at(-1)).toEqual({ question: gone.question, given: null, direction: 'late' });
  });

  it('takes the lock off with them', () => {
    const run = startedRun();

    deal(run, run.queue[0].question.answer === 500 ? 1000 : 500);
    give(run);
    run.patience.left = 100;
    advance(run, 100);

    expect(run).toMatchObject({ phase: 'serving', lockLeft: 0, tries: 0 });
  });

  it('closes the stall at the third', () => {
    const run = startedRun();

    for (let gone = 0; gone < TUNING.trust; gone++) {
      waitOut(run);
    }

    expect(run.phase).toBe('closed');
    expect(eventsOf(run, 'closed')).toMatchObject([{ reason: 'trust' }]);
    expect(eventsOf(run, 'stormed')).toHaveLength(TUNING.trust);
  });

  it('breaks the streak', () => {
    const run = startedRun();

    payFront(run);
    payFront(run);
    waitOut(run);
    drainEvents(run);
    payFront(run);

    expect(eventsOf(run, 'paid')[0].streak).toBe(1);
  });

  it('tells of it in order: stormed, then who is asked', () => {
    const run = startedRun();

    waitOut(run);

    expect(typesOf(run.events).filter((type) => type !== 'arrive' && type !== 'approach')).toEqual([
      'stormed',
      'ask',
    ]);
  });
});
