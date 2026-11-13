import { RIEL } from '../data/currency.js';
import { SURE_SUMS } from '../data/stages.js';
import { TUNING } from '../data/tuning.js';
import { nextRandom, pick, randomInt } from '../lib/rng.js';
import { fewestPieces } from './pieces.js';

const stepped = (rng, low, high, step) =>
  randomInt(rng, Math.ceil(low / step), Math.floor(high / step)) * step;

function paidWith(rng, stage) {
  if (stage.oftenPaid && nextRandom(rng) < TUNING.oftenPaidChance) {
    return stage.oftenPaid;
  }

  return pick(rng, stage.paidWith);
}

const MAKERS = {
  add(rng, stage) {
    const answer = stepped(rng, 2 * stage.priceStep, stage.most, stage.priceStep);
    const left = stepped(rng, stage.priceStep, answer - stage.priceStep, stage.priceStep);

    return { left, right: answer - left, answer };
  },

  sub(rng, stage) {
    const left = paidWith(rng, stage);
    const mostChange = Math.min(stage.most, left - stage.priceStep);
    const answer = stepped(rng, stage.least, mostChange, stage.priceStep);

    return { left, right: left - answer, answer };
  },

  mul(rng, stage) {
    const right = randomInt(rng, stage.times[0], stage.times[1]);
    const left = stepped(rng, stage.priceStep, stage.most / right, stage.priceStep);

    return { left, right, answer: left * right };
  },

  div(rng, stage) {
    const right = randomInt(rng, stage.shares[0], stage.shares[1]);
    const answer = stepped(rng, stage.least, stage.most, stage.priceStep);

    return { left: answer * right, right, answer };
  },
};

export const suitsStage = (answer, stage) =>
  answer >= stage.least &&
  answer <= stage.most &&
  answer % RIEL.step === 0 &&
  stage.hundreds.includes(Math.floor(answer / 100) % 10) &&
  fewestPieces(answer, stage.pieces) <= stage.mostPieces;

const isSame = (question, previous) =>
  !!previous &&
  question.op === previous.op &&
  question.left === previous.left &&
  question.right === previous.right;

export function makeQuestion(rng, { stage, op, previous }) {
  const sum = MAKERS[op] ? op : 'add';

  for (let i = 0; i < TUNING.drawTries; i++) {
    const question = { op: sum, ...MAKERS[sum](rng, stage) };

    if (suitsStage(question.answer, stage) && !isSame(question, previous)) {
      return question;
    }
  }

  return { ...SURE_SUMS[sum].find((sure) => !isSame(sure, previous)) };
}
