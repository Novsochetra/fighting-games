import { describe, expect, it } from 'vitest';
import { RIEL } from '../../../src/data/currency.js';
import { OPERATIONS } from '../../../src/data/operations.js';
import { STAGES, SURE_SUMS } from '../../../src/data/stages.js';
import { fewestPieces } from '../../../src/sim/pieces.js';
import { makeQuestion } from '../../../src/sim/question.js';

const DRAWS = 400;
const CASES = STAGES.flatMap((stage) => OPERATIONS.map((op) => [stage.number, op, stage]));

const ANSWERS = {
  add: ({ left, right }) => left + right,
  sub: ({ left, right }) => left - right,
  mul: ({ left, right }) => left * right,
  div: ({ left, right }) => left / right,
};

const isMoney = (value) => Number.isInteger(value) && value > 0 && value % RIEL.step === 0;

function draw(stage, op, seed = 7) {
  const rng = { seed };
  const questions = [];

  for (let i = 0; i < DRAWS; i++) {
    questions.push(makeQuestion(rng, { stage, op, previous: questions[i - 1] }));
  }

  return questions;
}

function expectFair(answer, stage) {
  expect(isMoney(answer)).toBe(true);
  expect(answer).toBeGreaterThanOrEqual(stage.least);
  expect(answer).toBeLessThanOrEqual(stage.most);
  expect(fewestPieces(answer, stage.pieces)).toBeLessThanOrEqual(stage.mostPieces);
  expect(stage.hundreds).toContain(Math.floor(answer / 100) % 10);
}

const OPERANDS = {
  add({ left, right }, stage) {
    expect(left % stage.priceStep).toBe(0);
    expect(right % stage.priceStep).toBe(0);
    expect(isMoney(right)).toBe(true);
  },

  sub({ left, right }, stage) {
    expect(RIEL.pieces).toContain(left);
    expect(stage.paidWith).toContain(left);
    expect(left).toBeGreaterThan(right);
    expect(isMoney(right)).toBe(true);
    expect(right % stage.priceStep).toBe(0);
  },

  mul({ left, right }, stage) {
    expect(left % stage.priceStep).toBe(0);
    expect(Number.isInteger(right)).toBe(true);
    expect(right).toBeGreaterThanOrEqual(2);
    expect(right).toBeLessThanOrEqual(stage.times[1]);
  },

  div({ right }, stage) {
    expect(Number.isInteger(right)).toBe(true);
    expect(right).toBeGreaterThanOrEqual(2);
    expect(right).toBeLessThanOrEqual(stage.shares[1]);
  },
};

describe.each(CASES)('a question at stage %i for %s', (_number, op, stage) => {
  const questions = draw(stage, op);

  it('is the sum asked for, with its right answer', () => {
    for (const question of questions) {
      expect(Object.keys(question).sort()).toEqual(['answer', 'left', 'op', 'right']);
      expect(question.op).toBe(op);
      expect(question.answer).toBe(ANSWERS[op](question));
    }
  });

  it('has an answer the stage allows', () => {
    for (const question of questions) {
      expectFair(question.answer, stage);
    }
  });

  it('is made of whole pieces of 100, as the stage sizes them', () => {
    for (const question of questions) {
      expect(isMoney(question.left)).toBe(true);
      OPERANDS[op](question, stage);
    }
  });

  it('is never the same sum twice running', () => {
    for (let i = 1; i < questions.length; i++) {
      const { left, right } = questions[i - 1];

      expect(questions[i]).not.toMatchObject({ left, right });
    }
  });

  it('comes in many sums', () => {
    const sums = new Set(questions.map(({ left, right }) => `${left} ${right}`));

    expect(sums.size).toBeGreaterThan(5);
  });
});

describe('makeQuestion', () => {
  const closed = { ...STAGES[2], mostPieces: 0 };

  it('draws the same sums again from the same seed', () => {
    expect(draw(STAGES[3], 'mul', 21)).toEqual(draw(STAGES[3], 'mul', 21));
    expect(draw(STAGES[3], 'mul', 21)).not.toEqual(draw(STAGES[3], 'mul', 22));
  });

  it('often has change counted from 50,000 once the till holds it', () => {
    const fromFifty = (stage) => draw(stage, 'sub').filter(({ left }) => left === 50000).length;

    expect(fromFifty(STAGES[3])).toBeGreaterThan(DRAWS * 0.4);
    expect(fromFifty(STAGES[2])).toBeLessThan(DRAWS * 0.3);
    expect(fromFifty(STAGES[1])).toBe(0);
  });

  it.each(OPERATIONS)('falls back to a sure %s when no draw passes', (op) => {
    const first = makeQuestion({ seed: 3 }, { stage: closed, op, previous: null });
    const second = makeQuestion({ seed: 3 }, { stage: closed, op, previous: first });

    expect(first).toEqual(SURE_SUMS[op][0]);
    expect(second).toEqual(SURE_SUMS[op][1]);
    expect(first).not.toBe(SURE_SUMS[op][0]);
  });

  it.each(STAGES)('keeps sure sums that pass stage $number', (stage) => {
    for (const sure of Object.values(SURE_SUMS).flat()) {
      expectFair(sure.answer, stage);
      OPERANDS[sure.op](sure, stage);
    }
  });

  it('asks an addition when the sum is none it knows', () => {
    expect(makeQuestion({ seed: 1 }, { stage: STAGES[0], op: 'pow' }).op).toBe('add');
  });
});
