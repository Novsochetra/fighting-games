import { describe, expect, it } from 'vitest';
import { advance, createRun, drainEvents } from '../../../src/sim/run.js';
import { payFront } from '../../unit/sim/serving.js';

const ALL = ['add', 'sub', 'mul', 'div'];
const sameSum = (left, right) =>
  left.op === right.op && left.left === right.left && left.right === right.right;

// Each bill was kept from the one made just before it, but bills are made a customer ahead. When
// the customer at the back went to the stall next door, the two either side of them met, and
// could be the same bill: seed 125 asked 1,000 − 500 twice running.
describe('a customer going next door', () => {
  // the days the review found it on, and a sweep of others
  const SEEDS = [54, 63, 125, 214, 278, ...Array.from({ length: 40 }, (_, i) => i + 1)];

  it('never leaves the same bill twice running, over many days', () => {
    for (const seed of SEEDS) {
      const run = createRun({ seed, ops: ALL });
      let last = null;

      // the day's clock stands still until the first customer is paid
      payFront(run);

      for (let step = 0; step < 500 && run.phase !== 'closed'; step++) {
        while (run.queue.length < 3 && run.phase !== 'closed') {
          advance(run, 250);
        }

        if (run.phase !== 'closed') {
          payFront(run);
        }

        for (const event of drainEvents(run).filter((each) => each.type === 'ask')) {
          expect(last && sameSum(last, event.customer.question), `seed ${seed}`).toBeFalsy();
          last = event.customer.question;
        }
      }
    }
  });
});
