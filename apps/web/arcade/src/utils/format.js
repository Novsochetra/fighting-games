// Whole amounts read cleaner without cents: $50, but $4.99.
export function formatMoney(amount, { currency, locale }) {
  const digits = Number.isInteger(amount) ? 0 : 2;
  const options = { minimumFractionDigits: digits, maximumFractionDigits: digits };
  return new Intl.NumberFormat(locale, { style: 'currency', currency, ...options }).format(amount);
}

export const formatCount = (count, locale) => new Intl.NumberFormat(locale).format(count);

// a run's time as its game's clock showed it: minutes and seconds, or hours past an hour
export function formatClock(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = String(seconds % 60).padStart(2, '0');

  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`;
}

// Read as a calendar day in UTC, so the day the server dated (in Phnom Penh, for a run) never
// shifts with the visitor's time zone.
export function formatDay(isoDay, locale, { withYear = true } = {}) {
  if (!isoDay) {
    return '';
  }

  const [year, month, day] = isoDay.split('-').map(Number);
  const options = { month: 'short', day: 'numeric', timeZone: 'UTC' };

  return new Intl.DateTimeFormat(
    locale,
    withYear ? { year: 'numeric', ...options } : options,
  ).format(Date.UTC(year, month - 1, day));
}
