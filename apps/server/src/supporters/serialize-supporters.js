import { toArcadeDay } from '../arcade-time.js';
import { tierOfCents } from './tiers.js';

export const CURRENCY = 'USD';

// the tier is named here, from the cents the gift was stored in, so every page and game that reads
// the list calls a gift the same thing
export function presentSupporter({ name, amountCents, message, createdAt }) {
  return {
    name,
    amount: amountCents / 100,
    tier: tierOfCents(amountCents),
    date: toArcadeDay(createdAt),
    message,
  };
}

export function serializeSupporters(supporters) {
  return JSON.stringify({ currency: CURRENCY, supporters: supporters.map(presentSupporter) });
}
