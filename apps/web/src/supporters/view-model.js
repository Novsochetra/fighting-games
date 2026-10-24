import { formatCount, formatDay, formatMoney, initialsOf, paletteOf } from './format.js';
import { podiumOf, rankByAmount, sortSupporters, totalOf } from './ranking.js';
import { tierOf } from './tiers.js';

const MEDALS = ['gold', 'silver', 'bronze'];

export function supportersPage(data, { order, locale }) {
  const ranked = rankByAmount(data.supporters);
  const money = (amount) => formatMoney(amount, { currency: data.currency, locale });
  const present = (supporter) => ({
    ...supporter,
    amountLabel: money(supporter.amount),
    dateLabel: formatDay(supporter.date, locale),
    initials: initialsOf(supporter.name),
    palette: paletteOf(supporter),
    medal: MEDALS[supporter.rank - 1] ?? '',
    tier: tierOf(supporter.amount).id,
    tierName: tierOf(supporter.amount).name,
  });
  return {
    order,
    isEmpty: ranked.length === 0,
    totalLabel: money(totalOf(ranked)),
    countLabel: formatCount(ranked.length, locale),
    podium: podiumOf(ranked).map(present),
    rows: sortSupporters(ranked, order).map(present),
  };
}
