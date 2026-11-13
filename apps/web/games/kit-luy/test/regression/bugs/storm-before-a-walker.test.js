import { describe, expect, it } from 'vitest';
import { TUNING } from '../../../src/data/tuning.js';
import { advance } from '../../../src/sim/run.js';
import { seat, startedRun } from '../../unit/sim/serving.js';

function fullRow() {
  const run = startedRun();

  seat(run, TUNING.seats - run.queue.length);
  run.patience.left = 30;
  run.arriving.left = 80;

  return run;
}

// Within one step the walkers were seated before anyone ran out of patience, so a customer who
// gave up first still left the walker no stool: the day ended or went on with how the frames fell.
describe('a customer giving up just before a walker comes', () => {
  it('frees the stool for them in one step, as in two', () => {
    const inOne = fullRow();
    const inTwo = fullRow();

    advance(inOne, 100);
    advance(inTwo, 50);
    advance(inTwo, 50);

    expect(inTwo.phase).not.toBe('closed');
    expect(inOne.phase).toBe(inTwo.phase);
    expect(inOne.queue).toEqual(inTwo.queue);
  });

  it('lets each customer in a long step give up in turn', () => {
    const run = startedRun();

    advance(run, run.patience.left + run.patience.total);

    expect(run.strikes).toBe(2);
  });
});
