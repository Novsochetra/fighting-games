export function walk(fighter, direction, speedFactor) {
  fighter.vx = direction * fighter.facing * fighter.def.speed * speedFactor;
  fighter.state = 'walk';
  fighter.walkDirection = direction;
}

export function standStill(fighter) {
  fighter.vx *= 0.6;
  fighter.state = 'idle';
}
