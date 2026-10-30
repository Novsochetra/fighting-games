import { formatMoney } from '@/utils/format.js';

// Each quick amount on the donate sheet ($1, $5, $10, $25) is where a tier starts. Bronze starts at
// zero so every gift the server takes has a tier.
export const TIERS = [
  { id: 'bronze', name: 'Bronze', min: 0 },
  { id: 'silver', name: 'Silver', min: 5 },
  { id: 'gold', name: 'Gold', min: 10 },
  { id: 'diamond', name: 'Diamond', min: 25 },
];

export const tierOf = (amount) => TIERS.findLast((tier) => amount >= tier.min);

export const nextTierOf = (amount) => TIERS.find((tier) => tier.min > amount) ?? null;

// Counted in cents, so $25 - $12.30 reads $12.70 and not $12.700000000000001.
const centsBetween = (from, to) => Math.round((to - from) * 100) / 100;

export function presentTier(amount, { currency, locale }) {
  const tier = tierOf(amount);
  const next = nextTierOf(amount);
  const missing = next ? formatMoney(centsBetween(amount, next.min), { currency, locale }) : '';
  return {
    id: tier.id,
    label: `${tier.name} supporter`,
    nudge: next ? `${missing} more for ${next.name}` : 'The top tier',
  };
}
