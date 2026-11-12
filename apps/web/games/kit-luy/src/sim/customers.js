import { KIND_OF } from '../data/customers.js';
import { stageOf } from '../data/stages.js';
import { TUNING } from '../data/tuning.js';
import { shuffled } from '../lib/rng.js';
import { makeQuestion } from './question.js';

function drawSum(run) {
  if (run.bag.length === 0) {
    run.bag = shuffled(run, run.ops);
  }

  return run.bag.pop();
}

// The lesson comes out of the first bag, so the first customers still hold one of each sum.
function lesson(run) {
  const { firstSum } = TUNING;

  run.bag = shuffled(run, run.ops).filter((op) => op !== firstSum.op);

  return { ...firstSum };
}

function nextQuestion(run) {
  if (run.made === 0 && run.ops.includes(TUNING.firstSum.op)) {
    return lesson(run);
  }

  return makeQuestion(run, {
    stage: stageOf(run.served),
    op: drawSum(run),
    previous: run.lastSum,
  });
}

const sameSum = (left, right) =>
  left.op === right.op && left.left === right.left && left.right === right.right;

// Bills are made a customer ahead, each kept apart from the one made before it. When the customer
// at the back goes next door, the one walking up comes straight after the new back of the row,
// and must be kept apart from that bill instead.
export function keepApart(run) {
  const before = run.queue[run.queue.length - 1]?.question;
  const walker = run.arriving.customer;

  if (before && sameSum(before, walker.question)) {
    walker.question = makeQuestion(run, {
      stage: stageOf(run.served),
      op: walker.question.op,
      previous: before,
    });
    run.lastSum = walker.question;
  }
}

export function nextCustomer(run) {
  const question = nextQuestion(run);

  run.made += 1;
  run.lastSum = question;

  return { id: run.made, kind: KIND_OF[question.op], question };
}
