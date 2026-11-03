import { SKILL_PLAY } from '../../data/skills.js';
import { canFire, fireSkill, openMoveOf } from './fire.js';

// a tackle skill fires as he goes in, and wins the ball more often
export function tackleLiftOf(match, tackler) {
  const move = openMoveOf(tackler, 'tackle');

  if (!canFire(match, tackler, move)) {
    return 0;
  }

  fireSkill(match, tackler, move);

  return SKILL_PLAY.tackle.odds;
}
