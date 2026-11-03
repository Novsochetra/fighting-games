import { findTeam } from '../../campaign/teams.js';

const signed = (value) => (value > 0 ? `+${value}` : String(value));

const shortOf = (team, id) => team?.short ?? id.slice(0, 3).toUpperCase();

export function tableRowsOf(rows, { teams = [], own = null, advance = 2 } = {}) {
  return rows.map((row, index) => {
    const team = findTeam(teams, row.team);

    return {
      rank: index + 1,
      team: row.team,
      short: shortOf(team, row.team),
      name: team?.name ?? row.team,
      played: row.played,
      won: row.won,
      drawn: row.drawn,
      lost: row.lost,
      diff: signed(row.goalsFor - row.goalsAgainst),
      points: row.points,
      own: row.team === own,
      through: index < advance,
    };
  });
}
