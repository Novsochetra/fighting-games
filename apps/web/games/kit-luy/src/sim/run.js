import { OPERATIONS } from '../data/operations.js';
import { STAGES } from '../data/stages.js';
import { TUNING } from '../data/tuning.js';
import { setOut } from './arrivals.js';
import { nextCustomer } from './customers.js';
import { clothCount } from './pieces.js';

export { advance } from './arrivals.js';
export { give } from './give.js';

function mixOf(ops) {
  const mix = OPERATIONS.filter((op) => Array.isArray(ops) && ops.includes(op));

  return mix.length > 0 ? mix : [...OPERATIONS];
}

function emptyRun({ seed, ops, totalAlways }) {
  const stage = STAGES[0];

  return {
    seed: Number.isFinite(seed) ? seed : 0,
    ops: mixOf(ops),
    totalAlways: !!totalAlways,
    phase: 'serving',
    started: false,
    elapsed: 0,
    served: 0,
    takings: 0,
    streak: 0,
    bestStreak: 0,
    stage: stage.number,
    pieces: [...stage.pieces],
    showTotal: !!totalAlways || stage.showTotal,
    queue: [],
    arriving: null,
    cloth: {},
    tries: 0,
    lockLeft: 0,
    missed: [],
    events: [],
    bag: [],
    made: 0,
    lastSum: null,
    tip: true,
  };
}

export function createRun(options) {
  const run = emptyRun(options || {});

  run.queue.push(nextCustomer(run));
  run.events.push({ type: 'ask', customer: run.queue[0] });
  setOut(run);

  return run;
}

export function deal(run, value) {
  const hasRoom = clothCount(run.cloth) < TUNING.clothMost;

  if (run.phase !== 'serving' || !run.pieces.includes(value) || !hasRoom) {
    return;
  }

  run.cloth[value] = (run.cloth[value] || 0) + 1;
  run.events.push({ type: 'deal', value, count: run.cloth[value] });
}

export function takeBack(run, value) {
  if (run.phase === 'closed' || !(run.cloth[value] > 0)) {
    return;
  }

  const count = run.cloth[value] - 1;

  if (count > 0) {
    run.cloth[value] = count;
  } else {
    delete run.cloth[value];
  }

  run.events.push({ type: 'take', value, count });
}

export function clearCloth(run) {
  if (run.phase === 'closed' || clothCount(run.cloth) === 0) {
    return;
  }

  run.cloth = {};
  run.events.push({ type: 'clear' });
}

export function drainEvents(run) {
  const events = run.events;

  run.events = [];

  return events;
}
