import { tierOfCents } from './tiers.js';

export const CURRENCY = 'USD';

// The arcade and most of its players are in Cambodia, so a gift made late in the evening there is
// dated that day, not the next one in UTC.
export const ARCADE_TIME_ZONE = 'Asia/Phnom_Penh';

const dayFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: ARCADE_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const toArcadeDay = (date) => dayFormat.format(date);

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
