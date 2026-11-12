import { describe, expect, it } from 'vitest';
import { TUNING } from '../../../src/data/tuning.js';
import { advance, deal, give } from '../../../src/sim/run.js';
import { startedRun } from '../../unit/sim/serving.js';

// The lock after a wrong count held the walker too, so a player who gave a wrong count again the
// moment each lock ended kept the clock nearly still for as long as they liked, and was told by
// how much they were out each time.
describe('giving a wrong count again and again', () => {
  it('lets the day run on, and closes the stall in its time', () => {
    const run = startedRun();
    const wrong = run.queue[0].question.answer === 500 ? 1000 : 500;

    deal(run, wrong);

    for (let tries = 0; tries < 200 && run.phase !== 'closed'; tries++) {
      give(run);
      advance(run, TUNING.wrongLockMs);
    }

    expect(run.phase).toBe('closed');
    expect(run.elapsed).toBeLessThan(TUNING.firstArrivalMs * TUNING.seats);
  });
});
