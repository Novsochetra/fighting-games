// The arcade and most of its players are in Cambodia, so a gift made late in the evening there is
// dated that day, not the next one in UTC, and a week of the leaderboard starts on Monday there.
export const ARCADE_TIME_ZONE = 'Asia/Phnom_Penh';

// Cambodia keeps UTC+7 all year, with no daylight saving to step over.
const ARCADE_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const dayFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: ARCADE_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const toArcadeDay = (date) => dayFormat.format(date);

export function weekStartOf(date) {
  const local = date.getTime() + ARCADE_OFFSET_MS;
  const midnight = local - (((local % DAY_MS) + DAY_MS) % DAY_MS);
  const daysSinceMonday = (new Date(midnight).getUTCDay() + 6) % 7;

  return new Date(midnight - daysSinceMonday * DAY_MS - ARCADE_OFFSET_MS);
}
