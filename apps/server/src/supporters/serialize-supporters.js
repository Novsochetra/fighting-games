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

export function presentSupporter({ name, amountCents, message, createdAt }) {
  return { name, amount: amountCents / 100, date: toArcadeDay(createdAt), message };
}

export function serializeSupporters(supporters) {
  return JSON.stringify({ currency: CURRENCY, supporters: supporters.map(presentSupporter) });
}
