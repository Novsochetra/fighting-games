import { SKILL_PLAY } from '../data/skills.js';
import { KEEPER, PLAYER } from '../data/tuning.js';
import { climbsOutOfReach } from './flight.js';
import { isLoose } from './loose-ball.js';
import { inBoxOf } from './pitch.js';
import { skillReachOf } from './skills/save.js';
import { diveReachOf, keeperReachOf } from './stats.js';
import { distance, segmentGap } from './vector.js';

// a keeper in their box reaches further and higher: they dive and jump, and further still with
// their save skill to spend (`base` is their own reach)
function reachOf(match, player) {
  if (player.role === 'keeper' && inBoxOf(match, player.team, player)) {
    const base = player.dive ? diveReachOf(player, match.goal) : keeperReachOf(player, match.goal);

    return {
      reach: skillReachOf(match, player, base),
      base,
      height: KEEPER.reachHeight,
      keeper: true,
    };
  }

  const height = climbsOutOfReach(match.ball) ? 0 : PLAYER.headHeight;

  return { reach: PLAYER.reach, base: PLAYER.reach, height, keeper: false };
}

// a skill pass is cut out only by a man near the one it is played to
function isCutOff(match, player) {
  const pass = match.ball.skillPass;
  const receiver = pass ? match.players[pass.receiver] : null;

  return (
    Boolean(receiver) &&
    player.team !== receiver.team &&
    distance(player, receiver) > SKILL_PLAY.pass.cutReach
  );
}

const canMeet = (match, player) =>
  player.noPickup === 0 && player.stun === 0 && !isCutOff(match, player);

// the one a pass was played to is set for it, except in the other side's box, where every
// defender attacks the ball; the man the player steers wins a loose ball he ran to by a little,
// as the player cannot see as well as the computer who gets there first
function edgeOf(match, player) {
  if (player.receiving > 0) {
    return inBoxOf(match, 1 - player.team, match.ball) ? 0 : PLAYER.receiverEdge;
  }

  return player.index === match.controlled && isLoose(match) ? PLAYER.steeredEdge : 0;
}

// a keeper takes a shot where it passes nearest them, not at the first touch of their reach
function isStillComing(ball, player) {
  const next = { x: ball.x + ball.vx, y: ball.y + ball.vy };

  return distance(next, player) < distance(ball, player);
}

// who meets the loose ball this tick: the nearest to the stretch it flew, among those who can
// reach that high
export function meeterOf(match) {
  const { ball } = match;
  const from = { x: ball.x - ball.vx, y: ball.y - ball.vy };
  let best = null;

  for (const player of match.players) {
    const { reach, base, height, keeper } = reachOf(match, player);
    const { gap } = segmentGap(from, ball, player);
    const waits = keeper && isStillComing(ball, player);
    const reaches = canMeet(match, player) && gap < reach && ball.z < height && !waits;
    const claim = gap - edgeOf(match, player);

    if (reaches && (!best || claim < best.claim)) {
      best = { player, gap, claim, stretch: gap / base, keeper, skilled: keeper && gap >= base };
    }
  }

  return best;
}
