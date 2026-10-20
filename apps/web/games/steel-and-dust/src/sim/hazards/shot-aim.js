import { STEP_UP } from '../stage/terrain.js';

// a shot never dives steeper than this share of its forward speed
const STEEPEST = 1.5;

// a raider on higher ground throws down at the hero: the shot drops as far as he is below by the
// time it reaches him, so it meets him at the height it left at; between fighters on one level it
// flies flat
export function diveToward(shooter, hero, { x, speed }) {
  const drop = hero.y - shooter.y;
  if (drop <= STEP_UP) {
    return 0;
  }
  const ticks = Math.max(1, Math.abs(hero.x - x) / speed);
  return Math.min(STEEPEST * speed, drop / ticks);
}

// a deflected shot flies back up the line it came down, at its new speed
export function reverseDive(shot, speed) {
  if (shot.vy) {
    shot.vy = (-shot.vy * speed) / shot.speed;
  }
}
