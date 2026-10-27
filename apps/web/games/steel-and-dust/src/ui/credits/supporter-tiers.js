// the tiers the arcade's API names each gift by, highest first, as the credits group them; the game
// takes a gift's tier from the API and never works one out of its amount
export const TIERS = [
  { id: 'diamond', name: 'Diamond' },
  { id: 'gold', name: 'Gold' },
  { id: 'silver', name: 'Silver' },
  { id: 'bronze', name: 'Bronze' },
];

const TIER_IDS = TIERS.map((tier) => tier.id);

export const isTier = (id) => TIER_IDS.includes(id);

export const tierName = (id) => TIERS.find((tier) => tier.id === id)?.name ?? '';

// a gift with no tier (a list kept offline from before the API named them) ranks below them all
export function tierRank(id) {
  const rank = TIER_IDS.indexOf(id);

  return rank < 0 ? TIER_IDS.length : rank;
}
