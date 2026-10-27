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

  return json.supporters.filter(isGift).map(({ name, amount, date }) => ({
    name: typeof name === 'string' ? name.trim() : '',
    cents: Math.round(amount * 100),
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

// one line a name, a supporter who gave twice under it counted once, with the most given first and
// the earliest first among equals; a gift without a name is only counted
export function creditedSupporters(gifts) {
  const byName = new Map();
  let anonymous = 0;

  for (const { name, cents, date } of gifts) {
    if (!name) {
      anonymous++;
      continue;
    }

    const kept = byName.get(name) ?? { name, cents: 0, date };
    byName.set(name, {
      name,
      cents: kept.cents + cents,
      date: date < kept.date ? date : kept.date,
    });
  }

  const names = [...byName.values()].sort(byGift).map((supporter) => supporter.name);

  return { names, anonymous };
}
