export const SIDES = ['attack', 'defend'];

export const currentRound = (duel) => duel?.rounds.at(-1) ?? null;

export const playerOf = (match, round, side) =>
  match.players[side === 'attack' ? round.attacker : round.defender];

export const otherSide = (side) => (side === 'attack' ? 'defend' : 'attack');

// a watched match leaves the human's side to the human; nobody can pick in an unwatched one
export function isHumanSide(match, round, side) {
  const watched = match.duelMemory?.watched ?? true;

  return (
    watched && match.humanTeam !== null && playerOf(match, round, side).team === match.humanTeam
  );
}

export function humanSideOf(match, round) {
  if (!round) {
    return null;
  }

  return SIDES.find((side) => isHumanSide(match, round, side)) ?? null;
}

export function createRound({ kind, attacker, defender }) {
  return {
    kind,
    attacker: attacker.index,
    defender: defender.index,
    picked: { attack: null, defend: null },
    carried: false,
    result: null,
  };
}

export const isChosen = (round) => round.picked.attack !== null && round.picked.defend !== null;
