import { moveOf } from '../../data/moves.js';
import { SKILL_PLAY } from '../../data/skills.js';
import { aimHeightOf, shootBall, strikeAtGoal } from '../kicks.js';
import { canFire, fireSkill } from './fire.js';

// a skill shot is aimed as a strong shot, not the full charge's that flies over
const AIM_POWER = 0.75;

// a role shot skill plays on: faster than any full charge, truer, with its look on the ball
export function skillShot(match, player, action) {
  const move = moveOf(action.move);

  if (match.ball.owner !== player.index) {
    return;
  }

  if (!canFire(match, player, move)) {
    shootBall(match, player, action);

    return;
  }

  fireSkill(match, player, move);
  strikeAtGoal(match, player, {
    power: 1,
    aimY: action.aimY,
    aimZ: aimHeightOf(match, AIM_POWER),
    pace: SKILL_PLAY.shot.speed,
    spreadShare: SKILL_PLAY.shot.spread,
    move: move.id,
  });
}
