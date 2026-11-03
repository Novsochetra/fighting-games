import { FORMATS } from '../../data/formats.js';
import { createMatch } from '../../sim/create-match.js';
import { attachDuels } from '../../sim/duel/index.js';

// a short match keeps three fifths of each half, for a quick go on a phone
const HALF_SHARE = { short: 0.6, normal: 1 };

export function createPlayedMatch({ seed, format, teams, length = 'normal', input }) {
  const halfSeconds = FORMATS[format].halfSeconds * (HALF_SHARE[length] ?? 1);
  const match = createMatch({ seed, humanTeam: 0, format, teams, halfSeconds, input });

  attachDuels(match);

  return match;
}

export const heroOf = (match) =>
  match.players.find((player) => player.star === 'sochetra' && player.team === match.humanTeam) ??
  null;
