// createMatch's own two teams, for a quick match before the story has met anyone; `plain` is the
// side whose plain kit each wears
export const PLAIN_TEAMS = Object.freeze([
  {
    id: 'plain-red',
    name: { en: 'Red', km: 'ក្រហម' },
    short: 'RED',
    kit: null,
    format: '11',
    plain: 0,
  },
  {
    id: 'plain-blue',
    name: { en: 'Blue', km: 'ខៀវ' },
    short: 'BLU',
    kit: null,
    format: '11',
    plain: 1,
  },
]);

const formatOf = (team) => team.format ?? '11';

export const opponentsOf = (options, homeId) => {
  const home = options.find((team) => team.id === homeId);

  return home
    ? options.filter((team) => team.id !== homeId && formatOf(team) === formatOf(home))
    : [];
};

// a team is offered only with a side of its own format to play; with fewer than two such, the two
// plain teams make up the list
export function quickOptions(teams = []) {
  const playable = teams.filter((team) => opponentsOf(teams, team.id).length > 0);

  return playable.length >= 2 ? playable : [...playable, ...PLAIN_TEAMS];
}

export function firstPicks(options) {
  const home = options[0]?.id ?? null;

  return { home, away: opponentsOf(options, home)[0]?.id ?? null };
}

const stepThrough = (list, id, by) => {
  const at = Math.max(
    0,
    list.findIndex((team) => team.id === id),
  );

  return list[(((at + by) % list.length) + list.length) % list.length]?.id ?? null;
};

const homeChoices = (options) => options.filter((team) => opponentsOf(options, team.id).length);

// a new home team keeps the opponent while it still fits, else takes the first that does
export function stepPick(options, picks, { side, by }) {
  if (side === 'away') {
    return { ...picks, away: stepThrough(opponentsOf(options, picks.home), picks.away, by) };
  }

  const home = stepThrough(homeChoices(options), picks.home, by);
  const opponents = opponentsOf(options, home);
  const keeps = opponents.some((team) => team.id === picks.away);

  return { home, away: keeps ? picks.away : (opponents[0]?.id ?? null) };
}

export const teamById = (options, id) => options.find((team) => team.id === id) ?? null;
