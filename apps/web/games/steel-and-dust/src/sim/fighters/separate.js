const SOLID_STATES = new Set(['idle', 'walk', 'attack', 'hurt', 'charge', 'squat']);

function isSolid(fighter) {
  return !fighter.airborne && !fighter.entering && SOLID_STATES.has(fighter.state);
}

function randomSide() {
  return Math.random() < 0.5 ? -1 : 1;
}

function pushApart(first, second) {
  const minimum = (first.side === second.side ? 5 : 7) * (first.scale + second.scale);
  const dx = second.x - first.x;
  if (Math.abs(dx) >= minimum) {
    return;
  }
  const push = Math.min(1.2, (minimum - Math.abs(dx)) / 2);
  const side = dx === 0 ? randomSide() : Math.sign(dx);
  first.x -= push * side;
  second.x += push * side;
}

export function separateFighters(fighters) {
  for (let i = 0; i < fighters.length; i++) {
    for (let j = i + 1; j < fighters.length; j++) {
      if (isSolid(fighters[i]) && isSolid(fighters[j])) {
        pushApart(fighters[i], fighters[j]);
      }
    }
  }
}
