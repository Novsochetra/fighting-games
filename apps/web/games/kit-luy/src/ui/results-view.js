import { RIEL } from '../data/currency.js';
import { countUp } from '../lib/count-up.js';
import { setText } from './dom.js';
import { showRank } from './rank-view.js';

function stampOf(summary, text) {
  if (summary.isNewBest && summary.score > 0) {
    return text.t('over.newBest');
  }

  return summary.rankUp ? text.t('over.rankUp') : '';
}

export function createResultsView(elements) {
  const { score, correct, accuracy, streak, level, stamp, rank } = elements;
  let shown = 0;
  let target = 0;

  return {
    show(summary, text) {
      const words = stampOf(summary, text);

      shown = 0;
      target = summary.score;
      stamp.hidden = words === '';
      setText(stamp, words);
      setText(correct, text.number(summary.correct));
      setText(accuracy, `${text.number(summary.accuracy)}%`);
      setText(streak, text.number(summary.bestStreak));
      setText(level, text.number(summary.level));
      showRank(rank, summary.savings, text);
    },

    roll(text) {
      shown = countUp(shown, target, RIEL.step);
      setText(score, text.money(shown));
    },
  };
}
