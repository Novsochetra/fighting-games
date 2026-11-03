import { SKILL_PLAY } from '../../data/skills.js';
import { PLAYER } from '../../data/tuning.js';
import { inBoxOf } from '../pitch.js';
import { nextRandom } from '../random.js';
import { gainSpirit } from '../spirit.js';
import { lengthOf, segmentGap } from '../vector.js';
import { canFire, fireSkill, openMoveOf } from './fire.js';

// the stretch of the ball's way he reads, in ticks, and how it comes off him
const LOOK_TICKS = 8;
const BACK_SHARE = 0.35;
const ACROSS_SHARE = 0.3;
const FLOORED_TICKS = 24;

const isStruck = ({ ball }) =>
  ball.owner === null &&
  ball.inGoal === null &&
  ball.lastTouch !== null &&
  (ball.kick === 'shot' || ball.kick === 'pass') &&
  ball.z < PLAYER.headHeight;

// a ball struck past him, out of his own reach but inside the skill's: a pass only in his own
// box, where it would find a man to score (thrown in front of every pass, it broke up every attack)
function canThrowAt(match, player, kicker) {
  const { ball } = match;

  if (player.team === kicker.team || player.role === 'keeper') {
    return false;
  }

  if (ball.kick === 'pass' && !inBoxOf(match, player.team, player)) {
    return false;
  }

  const ahead = { x: ball.x + ball.vx * LOOK_TICKS, y: ball.y + ball.vy * LOOK_TICKS };
  const { gap, along } = segmentGap(ball, ahead, player);

  return along > 0 && along < 1 && gap > PLAYER.reach && gap < SKILL_PLAY.block.reach;
}

// he throws himself across it and it comes off him, back the way it came and off to a side
function throwIn(match, player) {
  const { ball } = match;
  const side = nextRandom(match.random) < 0.5 ? -1 : 1;
  const speed = lengthOf(ball.vx, ball.vy);

  fireSkill(match, player, openMoveOf(player, 'block'));
  Object.assign(player, { x: ball.x, y: ball.y, vx: 0, vy: 0 });
  Object.assign(ball, {
    vx: -ball.vx * BACK_SHARE,
    vy: side * speed * ACROSS_SHARE,
    vz: 1.5,
    lastTouch: player.index,
    kick: null,
    move: null,
    skillPass: null,
  });
  Object.assign(player, { stun: FLOORED_TICKS, noPickup: FLOORED_TICKS });
  gainSpirit(match, player, 'block');
}

// a block skill fires by itself, on either side, and costs only when it does
export function throwBlocks(match) {
  if (!isStruck(match)) {
    return;
  }

  const kicker = match.players[match.ball.lastTouch];
  const blocker = match.players.find(
    (player) =>
      canFire(match, player, openMoveOf(player, 'block')) && canThrowAt(match, player, kicker),
  );

  if (blocker) {
    throwIn(match, blocker);
  }
}
