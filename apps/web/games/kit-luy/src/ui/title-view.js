import { setText } from './dom.js';
import { showRank } from './rank-view.js';

export function createTitleView({ best, savings, rank, chips }) {
  return function showTitle({ records, settings }, text) {
    setText(best, text.money(records.best));
    setText(savings, text.money(records.savings));
    showRank(rank, records.savings, text);

    for (const chip of chips) {
      chip.setAttribute('aria-pressed', String(settings.ops.includes(chip.dataset.op)));
    }
  };
}
