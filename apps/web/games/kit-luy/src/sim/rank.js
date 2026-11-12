import { RANKS } from '../data/ranks.js';

export function rankOf(savings) {
  return RANKS.filter((rank) => savings >= rank.from).pop();
}

export function rankProgress(savings) {
  const rank = rankOf(savings);
  const next = RANKS[RANKS.indexOf(rank) + 1] ?? null;
  const share = next ? (savings - rank.from) / (next.from - rank.from) : 1;

  return { rank, next, share };
}
