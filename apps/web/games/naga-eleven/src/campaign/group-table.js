const emptyRow = (team) => ({
  team,
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  points: 0,
});

function addSide(row, scored, conceded) {
  const won = scored > conceded ? 1 : 0;
  const drawn = scored === conceded ? 1 : 0;

  return {
    ...row,
    played: row.played + 1,
    won: row.won + won,
    drawn: row.drawn + drawn,
    lost: row.lost + 1 - won - drawn,
    goalsFor: row.goalsFor + scored,
    goalsAgainst: row.goalsAgainst + conceded,
    points: row.points + 3 * won + drawn,
  };
}

function addResult(rows, { home, away, homeGoals, awayGoals }) {
  rows.set(home, addSide(rows.get(home) ?? emptyRow(home), homeGoals, awayGoals));
  rows.set(away, addSide(rows.get(away) ?? emptyRow(away), awayGoals, homeGoals));
}

const goalDifference = (row) => row.goalsFor - row.goalsAgainst;

// points, then goal difference, then goals scored; teams level on all three keep the group's order,
// which lists the hero's team first
export function groupRows(record) {
  const rows = new Map(record.teams.map((team) => [team, emptyRow(team)]));
  const order = (row) => record.teams.indexOf(row.team);

  for (const result of record.results) {
    addResult(rows, result);
  }

  return [...rows.values()].sort(
    (first, second) =>
      second.points - first.points ||
      goalDifference(second) - goalDifference(first) ||
      second.goalsFor - first.goalsFor ||
      order(first) - order(second),
  );
}

export function groupTable(save, cupId) {
  const record = save.cups?.[cupId];

  return record ? groupRows(record) : [];
}

export const rankOf = (record, team) => groupRows(record).findIndex((row) => row.team === team);
