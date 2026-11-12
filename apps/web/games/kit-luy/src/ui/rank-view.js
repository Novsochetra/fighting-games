import { rankProgress } from '../sim/rank.js';
import { setText } from './dom.js';

export function showRank({ name, fill, next }, savings, text) {
  const progress = rankProgress(savings);
  const toGo = progress.next
    ? text.t('over.toNext', {
        amount: text.money(progress.next.from - savings),
        rank: text.t(`rank.${progress.next.id}`),
      })
    : text.t('over.top');

  setText(name, text.t(`rank.${progress.rank.id}`));
  setText(next, toGo);
  fill.style.transform = `scaleX(${progress.share})`;
}
