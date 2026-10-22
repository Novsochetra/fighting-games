export function isBossWindingUp(fighter) {
  return (
    fighter.side === 'enemy' &&
    fighter.def.boss &&
    fighter.state === 'attack' &&
    fighter.moveTime < fighter.move.startup
  );
}

// the last frames of a raider's wind-up blink red, but not a boss already sinking out of sight, nor
// one raising a guard: its gold glint is the tell (guard-counter.js)
export function isTelegraphing(fighter, tickCount) {
  const move = fighter.move;
  const windingUp =
    fighter.side === 'enemy' && fighter.state === 'attack' && fighter.moveTime < move.startup;
  return (
    windingUp &&
    !move.underground &&
    !move.guard &&
    move.startup - fighter.moveTime <= 10 &&
    Boolean((tickCount >> 1) & 1)
  );
}
