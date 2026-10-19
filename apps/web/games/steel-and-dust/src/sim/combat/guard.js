export function isGuarding(fighter) {
  if (fighter.airborne) {
    return false;
  }
  if (fighter.state === 'idle' || fighter.state === 'walk') {
    return true;
  }
  return fighter.state === 'attack' && fighter.move && fighter.moveTime < fighter.move.startup;
}

export function isFacing(target, attacker) {
  return (attacker.x - target.x) * target.facing > 0;
}

// heavy, charged, launching, diving and low hits get past a shield
function breaksGuard(move) {
  return (
    move.ultimate ||
    move.launch ||
    move.chargeLevel ||
    move.spike ||
    move.dive ||
    move.low ||
    move.damage >= 12
  );
}

export function blocksHit(attacker, target, move) {
  if (!target.def.shield || !isGuarding(target)) {
    return false;
  }
  if (breaksGuard(move)) {
    return false;
  }
  return isFacing(target, attacker);
}

export function canBeHit(target, move) {
  if (target.invincible > 0 || target.state === 'ko' || target.removed) {
    return false;
  }
  if (move.ultimate) {
    return true;
  }
  const { state } = target;
  return !(state === 'getup' || state === 'dash' || (state === 'down' && target.stateTime > 10));
}
