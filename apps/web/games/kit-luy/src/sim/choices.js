import { RIEL } from '../data/currency.js';
import { randomInt, shuffled } from '../lib/rng.js';

const CHOICES = 4;

const toStep = (value) => Math.round(value / RIEL.step) * RIEL.step;

// the answers a hurried head lands on: the other sum, one time too many or too few
const SLIPS = {
  add: ({ left, right }) => [Math.abs(left - right)],
  sub: ({ left, right }) => [left + right],
  mul: ({ left, right }) => [left * (right + 1), left * (right - 1)],
  div: ({ left, right }) => [toStep(left / (right + 1)), toStep(left / (right - 1))],
};

function nearMisses({ answer, step }) {
  const leap = step * 10;

  return [
    answer + step,
    answer - step,
    answer + step * 2,
    answer - step * 2,
    answer + leap,
    answer - leap,
  ];
}

function wrongAnswers(rng, question) {
  const all = [...nearMisses(question), ...SLIPS[question.op](question)];
  const valid = all.filter((value) => value > 0 && value !== question.answer);

  return shuffled(rng, [...new Set(valid)]).slice(0, CHOICES - 1);
}

export function makeChoices(rng, question) {
  const choices = wrongAnswers(rng, question);
  const correctIndex = randomInt(rng, 0, choices.length);

  choices.splice(correctIndex, 0, question.answer);

  return { choices, correctIndex };
}
