const AIM_RANGE = 120;
const AIM_HEIGHT = 60;

function canBeAimedAt(fighter) {
  return (
    fighter.side === 'enemy' && fighter.state !== 'ko' && !fighter.removed && !fighter.entering
  );
}

export function autoFace(game, player) {
  if (!game.settings.aim) {
    return;
  }
  let best = null;
  let bestDistance = 1e9;
  for (const enemy of game.fighters) {
    if (!canBeAimedAt(enemy)) {
      continue;
    }
    const distance = Math.abs(enemy.x - player.x);
    if (
      distance < bestDistance &&
      distance < AIM_RANGE &&
      Math.abs(enemy.y - player.y) < AIM_HEIGHT
    ) {
      bestDistance = distance;
      best = enemy;
    }
  }
  if (best && Math.abs(best.x - player.x) > 3) {
    player.facing = best.x > player.x ? 1 : -1;
  }
}
