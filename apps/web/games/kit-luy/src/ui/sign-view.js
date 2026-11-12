import { RIEL } from '../data/currency.js';
import { countUp } from '../lib/count-up.js';
import { replay, setText } from './dom.js';

export function createSignView({ takings, signBest, trust, streak }, text) {
  let shown = 0;

  return {
    showTrust(strikes, total) {
      [...trust.children].forEach((stamp, i) => stamp.classList.toggle('is-lost', i < strikes));
      trust.setAttribute(
        'aria-label',
        text.t('play.trust', { count: text.number(total - strikes) }),
      );
    },

    showStreak(count) {
      streak.hidden = count < 2;
      setText(streak, `×${text.number(count)}`);
      streak.setAttribute('aria-label', text.t('play.streak', { count: text.number(count) }));

      if (count >= 2) {
        replay(streak, 'is-bumped');
      }
    },

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
