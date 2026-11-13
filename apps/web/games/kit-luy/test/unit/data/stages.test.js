import { describe, expect, it } from 'vitest';
import { RIEL } from '../../../src/data/currency.js';
import { STAGES, SURE_SUMS, stageOf } from '../../../src/data/stages.js';

const pairs = STAGES.slice(1).map((stage, i) => [STAGES[i], stage]);

describe('stages', () => {
  it('numbers the stages from 1 and opens the first with nobody served', () => {
    expect(STAGES.map((stage) => stage.number)).toEqual([1, 2, 3, 4, 5]);
    expect(STAGES[0].from).toBe(0);
  });

  it('opens each stage later than the one before, for more pay', () => {
    expect(STAGES.map((stage) => stage.from)).toEqual([0, 8, 18, 30, 44]);
    expect(STAGES.map((stage) => stage.pay)).toEqual([500, 1000, 1500, 2000, 2500]);

    for (const [before, after] of pairs) {
      expect(after.from).toBeGreaterThan(before.from);
      expect(after.pay).toBeGreaterThan(before.pay);
    }
  });

  it('only ever adds pieces to the till', () => {
    expect(STAGES[0].pieces).toEqual([500, 1000, 2000, 5000]);

    for (const [before, after] of pairs) {
      expect(after.pieces).toEqual(expect.arrayContaining(before.pieces));
      expect(after.pieces.length).toBeGreaterThanOrEqual(before.pieces.length);
    }
  });

  it('holds only pieces of the currency, smallest first and each once', () => {
    for (const stage of STAGES) {
      expect(RIEL.pieces).toEqual(expect.arrayContaining(stage.pieces));
      expect(stage.pieces).toEqual([...new Set(stage.pieces)].sort((one, other) => one - other));
    }
  });

  it('never asks for less of an answer than the stage before allowed', () => {
    for (const [before, after] of pairs) {
      expect(after.mostPieces).toBeGreaterThanOrEqual(before.mostPieces);
      expect(after.hundreds).toEqual(expect.arrayContaining(before.hundreds));
      expect(after.most).toBeGreaterThan(before.most);
      expect(after.least).toBeLessThanOrEqual(before.least);
    }
  });

  it('shows the total on the cloth for the first two stages only', () => {
    expect(STAGES.map((stage) => stage.showTotal)).toEqual([true, true, false, false, false]);
  });

  it('has customers pay with a piece of the currency that leaves room for a price', () => {
    for (const stage of STAGES) {
      expect(RIEL.pieces).toEqual(expect.arrayContaining(stage.paidWith));
      expect(Math.min(...stage.paidWith)).toBeGreaterThanOrEqual(stage.least + stage.priceStep);
      expect([null, ...stage.paidWith]).toContain(stage.oftenPaid);
    }
  });

  it('steps its sizes in whole pieces of the smallest step', () => {
    for (const stage of STAGES) {
      expect(stage.priceStep % RIEL.step).toBe(0);
      expect(stage.least % stage.priceStep).toBe(0);
      expect(stage.times[0]).toBe(2);
      expect(stage.shares[0]).toBe(2);
      expect(stage.times[1]).toBeGreaterThanOrEqual(stage.times[0]);
      expect(stage.shares[1]).toBeGreaterThanOrEqual(stage.shares[0]);
    }
  });

  it.each([
    [0, 1],
    [7, 1],
    [8, 2],
    [17, 2],
    [18, 3],
    [29, 3],
    [30, 4],
    [43, 4],
    [44, 5],
    [5000, 5],
  ])('gives %i customers served stage %i', (served, number) => {
    expect(stageOf(served)).toBe(STAGES[number - 1]);
    expect(stageOf(served).number).toBe(number);
  });

  it('gives the first stage for a count that is no count', () => {
    for (const odd of [-3, NaN, undefined, null, 'many']) {
      expect(stageOf(odd).number).toBe(1);
    }
  });

  it('keeps two sure sums for every kind of sum, each with its right answer', () => {
    const answers = {
      add: (sum) => sum.left + sum.right,
      sub: (sum) => sum.left - sum.right,
      mul: (sum) => sum.left * sum.right,
      div: (sum) => sum.left / sum.right,
    };

    for (const [op, sums] of Object.entries(SURE_SUMS)) {
      expect(sums).toHaveLength(2);
      expect(sums[0]).not.toEqual(sums[1]);

      for (const sum of sums) {
        expect(sum.op).toBe(op);
        expect(sum.answer).toBe(answers[op](sum));
      }
    }
  });
});
