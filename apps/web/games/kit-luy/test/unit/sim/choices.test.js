import { describe, expect, it } from 'vitest';
import { RIEL } from '../../../src/data/currency.js';
import { LEVELS } from '../../../src/data/levels.js';
import { OPERATIONS } from '../../../src/data/operations.js';
import { makeChoices } from '../../../src/sim/choices.js';
import { makeQuestion } from '../../../src/sim/question.js';

function everyChoice(visit) {
  LEVELS.forEach((_, i) => {
    const rng = { seed: 31 * (i + 1) };

    for (let asked = 0; asked < 300; asked++) {
      const question = makeQuestion(rng, { level: i + 1, ops: OPERATIONS, previous: null });

      visit(makeChoices(rng, question), question);
    }
  });
}

describe('makeChoices', () => {
  it('offers four different amounts, the answer among them where it says', () => {
    everyChoice(({ choices, correctIndex }, question) => {
      expect(choices).toHaveLength(4);
      expect(new Set(choices).size).toBe(4);
      expect(choices[correctIndex]).toBe(question.answer);
    });
  });

  it('offers only amounts a till could hold: whole notes, above nothing', () => {
    everyChoice(({ choices }) => {
      for (const choice of choices) {
        expect(choice).toBeGreaterThan(0);
        expect(choice % RIEL.step).toBe(0);
      }
    });
  });

  it('puts the answer on every key in turn, not one', () => {
    const places = new Set();

    everyChoice(({ correctIndex }) => places.add(correctIndex));

    expect([...places].sort()).toEqual([0, 1, 2, 3]);
  });

  it('offers the smallest answer there is with three wrong ones above it', () => {
    const question = { op: 'sub', left: 200, right: 100, answer: 100, step: 100 };
    const { choices } = makeChoices({ seed: 4 }, question);

    expect(choices).toHaveLength(4);
    expect(Math.min(...choices)).toBe(100);
  });

  it('tempts with the other sum: what adding gives for a take-away', () => {
    const question = { op: 'sub', left: 5000, right: 1500, answer: 3500, step: 500 };
    const offered = new Set();

    for (let seed = 1; seed < 80; seed++) {
      makeChoices({ seed }, question).choices.forEach((choice) => offered.add(choice));
    }

    expect(offered).toContain(6500);
  });
});
