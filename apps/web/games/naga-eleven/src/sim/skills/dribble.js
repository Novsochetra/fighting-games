import { moveOf } from '../../data/moves.js';
import { SKILL_PLAY } from '../../data/skills.js';
import { keepCombo } from '../combos/pass-combo.js';
import { attackSign } from '../pitch.js';
import { gainSpirit } from '../spirit.js';
import { distance } from '../vector.js';
import { canFire, fireSkill } from './fire.js';

// the men in front of him as the burst starts, each of whom he beats once he is past him
const BEAT_REACH = 110;

const aheadOf = (player, other) => (other.x - player.x) * attackSign(player.team);

// beating a man keeps the pass combo going and starts its clock again
export function beatMan(match, player) {
  gainSpirit(match, player, 'beat');
  keepCombo(match, player);
}

// a dribble skill: a burst of pace in which no tackle wins the ball
export function startBurst(match, player, { move: id }) {
  const move = moveOf(id);

  if (match.ball.owner !== player.index || !canFire(match, player, move)) {
    return;
  }

  fireSkill(match, player, move);
  player.burst = SKILL_PLAY.dribble.ticks;
  player.beating = match.sides[1 - player.team]
    .filter((other) => aheadOf(player, other) > 0 && distance(player, other) < BEAT_REACH)
    .map((other) => other.index);
}

export const burstPaceOf = (player, hasBall) =>
  hasBall && player.burst > 0 ? SKILL_PLAY.dribble.speed : 1;

export const isBursting = (player) => (player?.burst ?? 0) > 0;

// each man he gets past with the ball in his burst is a man beaten
export function followBurst(match, player) {
  if (!isBursting(player) || match.ball.owner !== player.index || player.beating.length === 0) {
    return;
  }

  const passed = player.beating.filter((index) => aheadOf(player, match.players[index]) < 0);

  for (const index of passed) {
    beatMan(match, player);
    player.beating = player.beating.filter((each) => each !== index);
  }
}
