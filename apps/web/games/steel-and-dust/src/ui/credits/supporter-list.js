import { isTier, TIERS, tierRank } from './supporter-tiers.js';

const DAY = /^\d{4}-\d{2}-\d{2}$/;

function isGift(entry) {
  return (
    Number.isFinite(entry?.amount) &&
    entry.amount > 0 &&
    typeof entry.date === 'string' &&
    DAY.test(entry.date)
  );
}

// the arcade's list of gifts (`api/supporters`) read again here, since the game shares no code with
// the arcade; null when it is not a list at all
export function readSupporterList(json) {
  if (!Array.isArray(json?.supporters)) {
    return null;
  }

  return json.supporters.filter(isGift).map(({ name, amount, tier, date }) => ({
    name: typeof name === 'string' ? name.trim() : '',
    cents: Math.round(amount * 100),
    tier: isTier(tier) ? tier : null,
    date,
  }));
}

function byGift(first, second) {
  return (
    second.cents - first.cents ||
    first.date.localeCompare(second.date) ||
    first.name.localeCompare(second.name)
  );
}

// a supporter who gave more than once is named once, by all they gave, under the highest tier they
// reached, as the arcade's list shows each of their gifts
function joined(kept, gift) {
  if (!kept) {
    return gift;
  }

  return {
    name: gift.name,
    cents: kept.cents + gift.cents,
    date: gift.date < kept.date ? gift.date : kept.date,
    tier: tierRank(gift.tier) < tierRank(kept.tier) ? gift.tier : kept.tier,
  };
}

function groupOf(tier, { people, anonymous }) {
  const names = people
    .filter((person) => person.tier === tier)
    .sort(byGift)
    .map((person) => person.name);

  return { tier, names, anonymous: anonymous.get(tier) ?? 0 };
}

// the supporters by tier, highest first, the most given first in each; a gift without a name is only
// counted, in its tier, and gifts with no tier come last
export function creditedSupporters(gifts) {
  const byName = new Map();
  const anonymous = new Map();

  for (const gift of gifts) {
    if (gift.name) {
      byName.set(gift.name, joined(byName.get(gift.name), gift));
    } else {
      anonymous.set(gift.tier, (anonymous.get(gift.tier) ?? 0) + 1);
    }
  }

  const supporters = { people: [...byName.values()], anonymous };

  return [...TIERS.map((tier) => tier.id), null]
    .map((tier) => groupOf(tier, supporters))
    .filter((group) => group.names.length || group.anonymous);
}
