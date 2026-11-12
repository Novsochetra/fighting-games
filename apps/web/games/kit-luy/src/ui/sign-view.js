import { RIEL } from '../data/currency.js';
import { countUp } from '../lib/count-up.js';
import { setText } from './dom.js';

export function createSignView({ takings, signBest }, text) {
  let shown = 0;

  return {
    reset() {
      shown = 0;
    },

    roll(amount) {
      shown = countUp(shown, amount, RIEL.step);
      setText(takings, text.money(shown));
    },

    showBest(best) {
      setText(signBest, best > 0 ? text.t('title.best', { amount: text.money(best) }) : '');
    },
  };
}
