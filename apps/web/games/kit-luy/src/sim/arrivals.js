import { TUNING } from '../data/tuning.js';
import { nextCustomer } from './customers.js';
import { drainPatience } from './storm.js';

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
    run.closedBy = 'stools';
    run.arriving.left = 0;
    run.events.push({ type: 'closed', customer: run.arriving.customer, reason: 'stools' });

    return;
  }

  sit(run);
}

// A step longer than a walk (a tab coming back) seats everyone who arrived in it.
function walk(run, ms) {
  run.elapsed += ms;
  run.arriving.left -= ms;

  while (run.phase !== 'closed' && run.arriving.left <= 0) {
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
  run.lockLeft = Math.max(0, run.lockLeft - ms);

  if (run.lockLeft === 0) {
    run.phase = 'serving';
    run.events.push({ type: 'unlock' });
  }
}

export function advance(run, ms) {
  if (run.phase === 'closed' || typeof ms !== 'number' || !Number.isFinite(ms) || ms <= 0) {
    return;
  }

  if (run.phase === 'locked') {
    countLockDown(run, ms);
  }

  // A wrong count costs time: customers keep walking up through the lock. Were they held, giving
  // a wrong count again the moment each lock ended would keep the day still for good.
  if (run.started) {
    walk(run, ms);
    drainPatience(run, ms);
  }
}
