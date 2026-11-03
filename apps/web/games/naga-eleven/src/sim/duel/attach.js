import { meetingOf } from './detect.js';
import { beginSpecial } from './special.js';
import { startDuel } from './start.js';
import { tickDuel } from './tick-duel.js';

function beginDuel(match) {
  const meeting = match.duel ? null : meetingOf(match);

  return meeting ? startDuel(match, { kind: 'field', ...meeting }) : false;
}

// `watched` says a show plays each duel and the human picks their side's options in it; with
// nobody watching the computer picks for both sides and each duel finishes itself
export function attachDuels(match, { watched = match.humanTeam !== null } = {}) {
  match.duel = null;
  match.duelMemory = { next: 1, pairs: {}, quietUntil: 0, watched, won: [0, 0] };
  match.hooks = { ...match.hooks, duel: beginDuel, special: beginSpecial, duelTick: tickDuel };

  return match;
}
