import { describe, expect, it } from 'vitest';

import { CINEMA } from '../../../../src/data/cinema.js';
import { affords, countTick, createBudget } from '../../../../src/render/cinema/budget.js';

const { share, headStart } = CINEMA.budget;

describe("a match's budget of show time", () => {
  it('counts ticks of play and ticks of show apart', () => {
    const budget = createBudget();

    countTick(budget, { showing: false });
    countTick(budget, { showing: true });
    countTick(budget, { showing: true });

    expect(budget).toEqual({ play: 1, shows: 2 });
  });

  it('has room for the first duel of a match from its kick off', () => {
    expect(affords(createBudget(), 400)).toBe(true);
  });

  it('keeps the shows to their share of the real time once play has run', () => {
    const budget = { play: 6000, shows: 0 };
    const room = (share / (1 - share)) * (budget.play + headStart);

    budget.shows = Math.floor(room) - 10;

    expect(affords(budget, 10)).toBe(true);
    expect(affords(budget, 11)).toBe(false);
    expect(budget.shows / (budget.shows + budget.play + headStart)).toBeLessThanOrEqual(share);
  });

  it('never says no where no budget is kept', () => {
    expect(affords(null, 1e9)).toBe(true);
  });
});
