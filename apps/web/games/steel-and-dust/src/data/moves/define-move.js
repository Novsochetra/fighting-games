function hitstopFor(damage) {
  if (damage >= 14) {
    return 11;
  }
  if (damage >= 10) {
    return 9;
  }
  if (damage >= 7) {
    return 7;
  }
  return 5;
}

export function defineMove({ frames: [startup, active, recovery], ...spec }) {
  return {
    startup,
    active,
    recovery,
    hitstop: hitstopFor(spec.damage),
    hitstun: 12 + spec.damage,
    next: {},
    windup: {},
    strike: {},
    ...spec,
  };
}

export function normalizeMoves(moves) {
  for (const [id, move] of Object.entries(moves)) {
    move.id = id;
    move.aerial = id.startsWith('A');
    move.cancelWindow ??= [move.startup + move.active, move.startup + move.active + move.recovery];
  }
  return moves;
}

export function moveLength(move) {
  return move.startup + move.active + move.recovery;
}

export function activeEnd(move) {
  return move.startup + move.active;
}
