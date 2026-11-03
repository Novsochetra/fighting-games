// the story is told round him: what a rival says in a match, he says to Sochetra
export const HERO = 'sochetra';

// a story match is one the player plays; a match the computer plays both sides of is told from
// team 0's side
export const ourTeam = (match) => match.humanTeam ?? 0;

export function leadOf(match) {
  const ours = ourTeam(match);

  return match.score[ours] - match.score[1 - ours];
}

export const starOf = (match, index) =>
  Number.isInteger(index) ? (match.players?.[index]?.star ?? null) : null;

// the phases a late moment can be told in: never over a duel's cut-in, at half time or after
const QUIET_PHASES = ['duel', 'halfTime', 'over'];

export const inPlay = (match) => !QUIET_PHASES.includes(match.phase);

// late in a match, if a trigger names no minute: three quarters of the way through
export const lateMinuteOf = (match) => (match.format === '7' ? 30 : 68);

export const eventsOf = (events, type) => events.filter((event) => event.type === type);

export const whistled = (events, kind, half) =>
  eventsOf(events, 'whistle').some(
    (event) => event.kind === kind && (half === undefined || (event.half ?? 1) === half),
  );

const DUEL_SEATS = ['attacker', 'defender', 'shooter', 'keeper', 'carrier', 'challenger'];

const indexOf = (seat) => (Number.isInteger(seat) ? seat : seat?.index);

// the duel module's state names its players by seat or as a list; any of them may be the rival
export function duelStars(duel, match) {
  const seats = [...DUEL_SEATS.map((seat) => duel?.[seat]), ...(duel?.players ?? [])];

  return seats.map((seat) => starOf(match, indexOf(seat))).filter(Boolean);
}
