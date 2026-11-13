import { CINEMA } from '../../data/cinema.js';

export const createBudget = () => ({ play: 0, shows: 0 });

export function countTick(budget, { showing }) {
  if (showing) {
    budget.shows += 1;
  } else {
    budget.play += 1;
  }
}

// with no budget kept (a test, an unwatched match) it never says no
export function affords(budget, ticks) {
  if (!budget) {
    return true;
  }

  const { share, headStart } = CINEMA.budget;
  const allowed = (share / (1 - share)) * (budget.play + headStart);

  return budget.shows + ticks <= allowed;
}
