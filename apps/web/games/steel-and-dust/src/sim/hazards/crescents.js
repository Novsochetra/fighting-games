import { groundAt, isWall } from '../stage/terrain.js';

const CRESCENT_SPEED = 3.2;
const CRESCENT_DAMAGE = 12;

// a crescent wave skims the road away from the swing, low enough for the hero to jump
export function spawnCrescent(game, fighter) {
  const x = fighter.x + fighter.facing * 20;
  game.projectiles.push({
    kind: 'crescent',
    x,
    y: groundAt(game.terrain, x),
    direction: fighter.facing,
    side: fighter.side,
    time: 0,
    damage: CRESCENT_DAMAGE,
    speed: CRESCENT_SPEED,
    hitTargets: new Set(),
  });
  game.io.sfx('swingSwordBig', false, { x: fighter.x, dir: fighter.facing });
}

// it rides the road up and down its steps and breaks on a rise too tall to step up
export function skimGround(game, shot) {
  if (isWall(game.terrain, shot.x, shot.y)) {
    shot.dead = true;
    return;
  }
  shot.y = groundAt(game.terrain, shot.x);
}
