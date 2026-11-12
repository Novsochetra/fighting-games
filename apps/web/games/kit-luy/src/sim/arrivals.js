import { TUNING } from '../data/tuning.js';
import { nextCustomer } from './customers.js';

export const arrivalMs = (served) =>
  Math.max(TUNING.minArrivalMs, TUNING.firstArrivalMs - TUNING.arrivalDropMs * served);

export function setOut(run) {
  const customer = nextCustomer(run);
  const ms = arrivalMs(run.served);

  run.arriving = { customer, left: ms, total: ms };
  run.events.push({ type: 'approach', customer, ms });
}

export function sit(run) {
  const { customer } = run.arriving;

  run.queue.push(customer);
  run.events.push({ type: 'arrive', customer });
  setOut(run);
}

function arrive(run) {
  if (run.queue.length >= TUNING.seats) {
    run.phase = 'closed';
    run.arriving.left = 0;
    run.events.push({ type: 'closed', customer: run.arriving.customer });

    return;
  }

  sit(run);
  run.tip = false;
}

// A step longer than a walk (a tab coming back) seats everyone who arrived in it.
function walk(run, ms) {
  run.elapsed += ms;
  run.arriving.left -= ms;

  while (run.phase === 'serving' && run.arriving.left <= 0) {
    const late = -run.arriving.left;

    arrive(run);

    // the day ends the moment that customer finds no stool, not at the end of the step
    if (run.phase === 'closed') {
      run.elapsed -= late;
    } else {
      run.arriving.left -= late;
    }
  }
}

function countLockDown(run, ms) {
  const over = ms - run.lockLeft;

  run.lockLeft = Math.max(0, -over);

  if (over < 0) {
    return 0;
  }

  run.phase = 'serving';
  run.events.push({ type: 'unlock' });

  return over;
}

export function advance(run, ms) {
  if (run.phase === 'closed' || typeof ms !== 'number' || !Number.isFinite(ms) || ms <= 0) {
    return;
  }

  const left = run.phase === 'locked' ? countLockDown(run, ms) : ms;

  // a wrong give on the very first bill must still unlock, though the clock has yet to start
  if (run.started && left > 0) {
    walk(run, left);
  }
}
