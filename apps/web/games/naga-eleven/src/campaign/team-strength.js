export const DEFAULT_STRENGTH = 50;

const OUTFIELD_STATS = ['speed', 'shot', 'pass', 'dribble', 'tackle', 'stamina'];

const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

function ratingOf(player) {
  const stats = player.stats ?? {};

  if (player.role === 'keeper') {
    return Number(stats.keeping) || DEFAULT_STRENGTH;
  }

  return average(OUTFIELD_STATS.map((stat) => Number(stats[stat]) || DEFAULT_STRENGTH));
}

export function teamStrength(team) {
  const players = team?.players ?? [];

  return players.length > 0 ? average(players.map(ratingOf)) : DEFAULT_STRENGTH;
}
