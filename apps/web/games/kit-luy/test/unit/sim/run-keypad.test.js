import { describe, expect, it } from 'vitest';
import { STAGES } from '../../../src/data/stages.js';
import { TUNING } from '../../../src/data/tuning.js';
import {
  clearTyped,
  deal,
  drainEvents,
  eraseDigit,
  give,
  typeDigits,
} from '../../../src/sim/run.js';
import { eventsOf, newRun } from './serving.js';

const keypadRun = () => {
  const run = newRun({ mode: 'keypad' });

  drainEvents(run);

  return run;
};

describe('the number pad', () => {
  it('types an amount a key at a time, and says what is typed', () => {
    const run = keypadRun();

    typeDigits(run, '1');
    typeDigits(run, '000');

    expect(run.typed).toBe('1000');
    expect(eventsOf(run, 'type').map((event) => event.typed)).toEqual(['1', '1000']);
  });

  it('pays the customer the amount typed, at the speed it took, but never as clean', () => {
    const run = keypadRun();

    typeDigits(run, '1000');
    give(run);

    expect(eventsOf(run, 'paid')[0]).toMatchObject({
      clean: false,
      speed: 'perfect',
      pieces: [1000],
      gain: STAGES[0].pay * 3,
    });
    expect(run.typed).toBe('');
  });

  it('refuses a wrong amount and leaves it typed to be put right', () => {
    const run = keypadRun();

    typeDigits(run, '1500');
    give(run);

    expect(eventsOf(run, 'wrong')[0]).toMatchObject({ direction: 'over' });
    expect(run).toMatchObject({ phase: 'locked', typed: '1500' });
  });

  it('erases the last figure, and clears the lot', () => {
    const run = keypadRun();

    typeDigits(run, '1250');
    eraseDigit(run);
    expect(run.typed).toBe('125');

    clearTyped(run);
    expect(run.typed).toBe('');
  });

  it.each([['0'], ['00'], ['000'], ['abc'], ['1.5'], [''], [5]])(
    'types nothing for %j alone',
    (keys) => {
      const run = keypadRun();

      typeDigits(run, keys);

      expect(run.typed).toBe('');
      expect(run.events).toEqual([]);
    },
  );

  it('stops at the longest amount a bill can come to', () => {
    const run = keypadRun();

    typeDigits(run, '9'.repeat(TUNING.mostTyped));
    typeDigits(run, '9');

    expect(run.typed).toHaveLength(TUNING.mostTyped);
  });

  it('gives nothing when nothing is typed', () => {
    const run = keypadRun();

    give(run);

    expect(run).toMatchObject({ phase: 'serving', served: 0 });
  });

  it('counts out no pieces, and a money day types nothing', () => {
    const keypad = keypadRun();
    const money = newRun();

    deal(keypad, 1000);
    typeDigits(money, '1000');

    expect(keypad.cloth).toEqual({});
    expect(money.typed).toBe('');
  });
});
