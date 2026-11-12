import { nextCustomer } from '../../../src/sim/customers.js';
import { piecesFor } from '../../../src/sim/pieces.js';
import { advance, createRun, deal, drainEvents, give } from '../../../src/sim/run.js';

export const ALL = ['add', 'sub', 'mul', 'div'];

export const newRun = (options = {}) => createRun({ seed: 12, ops: ALL, ...options });

export const dealAll = (run, values) => values.forEach((value) => deal(run, value));

export function payFront(run) {
  dealAll(run, piecesFor(run.queue[0].question.answer, run.pieces));
  give(run);
}

export function serve(run, count) {
  for (let i = 0; i < count; i++) {
    payFront(run);
  }
}

// a run whose clock is going, with its opening events drained
export function startedRun(options) {
  const run = newRun(options);

  payFront(run);
  drainEvents(run);

  return run;
}

export function seat(run, count) {
  for (let i = 0; i < count; i++) {
    run.queue.push(nextCustomer(run));
  }
}

export const ask = (run, question) => {
  run.queue[0].question = question;
};

export const typesOf = (events) => events.map((event) => event.type);

export const eventsOf = (run, type) => run.events.filter((event) => event.type === type);

export function waitForArrival(run) {
  advance(run, run.arriving.left);
}

export const snapshot = (run) => JSON.stringify(run);
