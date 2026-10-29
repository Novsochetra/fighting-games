export const formatScore = (score, locale) => new Intl.NumberFormat(locale).format(score);

// a run's time as its game's clock showed it: minutes and seconds, or hours past an hour
export function formatClock(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = String(seconds % 60).padStart(2, '0');

  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`;
}

// Read as a calendar day in UTC, so the day the server dated in Phnom Penh never shifts with the
// visitor's time zone.
export function formatDay(isoDay, locale) {
  const [year, month, day] = isoDay.split('-').map(Number);
  const options = { month: 'short', day: 'numeric', timeZone: 'UTC' };

  return new Intl.DateTimeFormat(locale, options).format(Date.UTC(year, month - 1, day));
}
