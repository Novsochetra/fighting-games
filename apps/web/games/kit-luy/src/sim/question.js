import { RIEL } from '../data/currency.js';
import { levelSpec } from '../data/levels.js';
import { nextRandom, pick, randomInt } from '../lib/rng.js';

const RETRIES = 6;
const PAID_WITH_A_NOTE = 0.5;

const stepped = (rng, low, high, step) => randomInt(rng, low / step, high / step) * step;

// Change is mostly counted back from a banknote, so half the take-aways start from one.
function amountPaid(rng, spec) {
  const notes = RIEL.notes.filter((note) => note >= spec.step * 2 && note <= spec.max);

  if (notes.length > 0 && nextRandom(rng) < PAID_WITH_A_NOTE) {
    return pick(rng, notes);
  }

  return stepped(rng, spec.step * 2, spec.max, spec.step);
}

const MAKERS = {
  add(rng, spec) {
    const left = stepped(rng, spec.step, spec.max - spec.step, spec.step);
    const right = stepped(rng, spec.step, spec.max - left, spec.step);

    return { left, right, answer: left + right };
  },

  sub(rng, spec) {
    const left = amountPaid(rng, spec);
    const right = stepped(rng, spec.step, left - spec.step, spec.step);

    return { left, right, answer: left - right };
  },

  mul(rng, spec) {
    const left = stepped(rng, spec.step, spec.unitMax, spec.step);
    const right = randomInt(rng, spec.times[0], spec.times[1]);

    return { left, right, answer: left * right };
  },

  div(rng, spec) {
    const answer = stepped(rng, spec.step, spec.unitMax, spec.step);
    const right = randomInt(rng, spec.times[0], spec.times[1]);

    return { left: answer * right, right, answer };
  },
};

const isSame = (question, previous) =>
  !!previous &&
  question.op === previous.op &&
  question.left === previous.left &&
  question.right === previous.right;

function drawQuestion(rng, level, ops) {
  const spec = levelSpec(level);
  const op = pick(rng, ops);

  return { op, step: spec.step, ...MAKERS[op](rng, spec) };
}

export function makeQuestion(rng, { level, ops, previous }) {
  let question = drawQuestion(rng, level, ops);

  for (let i = 0; i < RETRIES && isSame(question, previous); i++) {
    question = drawQuestion(rng, level, ops);
  }

  return question;
}
