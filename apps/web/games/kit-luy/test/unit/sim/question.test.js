import { describe, expect, it } from 'vitest';
import { RIEL } from '../../../src/data/currency.js';
import { LEVELS } from '../../../src/data/levels.js';
import { OPERATIONS } from '../../../src/data/operations.js';
import { makeQuestion } from '../../../src/sim/question.js';

const SOLVE = {
  add: ({ left, right }) => left + right,
  sub: ({ left, right }) => left - right,
  mul: ({ left, right }) => left * right,
  div: ({ left, right }) => left / right,
};

function questions({ level, ops = OPERATIONS, count = 400 }) {
  const rng = { seed: level * 977 };
  const asked = [];

  for (let i = 0; i < count; i++) {
    asked.push(makeQuestion(rng, { level, ops, previous: asked.at(-1) }));
  }

  return asked;
}

const everyLevel = LEVELS.map((_, i) => i + 1);

describe('makeQuestion', () => {
  it.each(everyLevel)('gives the right answer to every sum of level %i', (level) => {
    for (const question of questions({ level })) {
      expect(question.answer).toBe(SOLVE[question.op](question));
    }
  });

  it.each(everyLevel)('keeps level %i in whole riel notes, above nothing', (level) => {
    for (const { op, left, right, answer } of questions({ level })) {
      const amounts = op === 'add' || op === 'sub' ? [left, right, answer] : [left, answer];

      for (const amount of amounts) {
        expect(amount).toBeGreaterThan(0);
        expect(amount % RIEL.step).toBe(0);
      }
    }
  });

  it.each(everyLevel)('keeps level %i within its prices and its times', (level) => {
    const spec = LEVELS[level - 1];

    for (const { op, left, right, answer } of questions({ level })) {
      if (op === 'add' || op === 'sub') {
        expect(Math.max(left, answer)).toBeLessThanOrEqual(spec.max);
      } else {
        expect(right).toBeGreaterThanOrEqual(spec.times[0]);
        expect(right).toBeLessThanOrEqual(spec.times[1]);
        expect(op === 'mul' ? left : answer).toBeLessThanOrEqual(spec.unitMax);
      }
    }
  });

  it('asks only the sums a player left in the mix', () => {
    const asked = questions({ level: 3, ops: ['mul', 'div'] });

    expect(new Set(asked.map((question) => question.op))).toEqual(new Set(['mul', 'div']));
  });

  it('asks every kind of sum when all are in the mix', () => {
    const asked = questions({ level: 1 });

    expect(new Set(asked.map((question) => question.op))).toEqual(new Set(OPERATIONS));
  });

  it('pays with a banknote for about half the change it asks for', () => {
    const changes = questions({ level: 5, ops: ['sub'], count: 600 });
    const fromNote = changes.filter((question) => RIEL.notes.includes(question.left));

    expect(fromNote.length).toBeGreaterThan(250);
    expect(fromNote.length).toBeLessThan(450);
  });

  it('does not ask the same sum twice running, even on the first level', () => {
    const asked = questions({ level: 1, ops: ['mul'], count: 300 });
    const repeats = asked.filter(
      (question, i) =>
        i > 0 && question.left === asked[i - 1].left && question.right === asked[i - 1].right,
    );

    expect(repeats).toEqual([]);
  });

  it('plays past the last level on the last level’s sums', () => {
    const question = makeQuestion({ seed: 1 }, { level: 40, ops: ['add'], previous: null });

    expect(question.step).toBe(LEVELS.at(-1).step);
  });
});
