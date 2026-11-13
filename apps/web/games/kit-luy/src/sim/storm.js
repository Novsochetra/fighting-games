import { TUNING } from '../data/tuning.js';
import { askNext } from './serve-next.js';

function close(run, customer) {
  run.phase = 'closed';
  run.closedBy = 'trust';
  run.arriving.left = 0;
  run.events.push({ type: 'closed', customer, reason: 'trust' });
}

// The customer in front has waited all they will: they get up unpaid, the money on the counter
// goes back to the till, and the stall loses some of its trust.
function stormOff(run) {
  const customer = run.queue.shift();

  // a bill already counted wrong is listed by that first wrong count
  if (run.tries === 0) {
    run.missed.push({ question: customer.question, given: null, direction: 'late' });
  }

  run.strikes += 1;
  run.streak = 0;
  run.cloth = {};
  run.typed = '';
  run.tries = 0;
  run.lockLeft = 0;
  run.phase = 'serving';
  run.events.push({ type: 'stormed', customer, strikes: run.strikes });

  if (run.strikes >= TUNING.trust) {
    close(run, customer);
  } else {
    askNext(run);
  }
}

export function drainPatience(run, ms) {
  if (run.phase === 'closed' || !run.started) {
    return;
  }

  run.patience.left = Math.max(0, run.patience.left - ms);

  if (run.patience.left === 0) {
    stormOff(run);
  }
}
