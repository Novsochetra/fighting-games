import { AI } from '../../data/tuning.js';
import { aimAwayFromKeeper } from '../aim.js';
import { aimHeightOf } from '../kicks.js';
import { goalOf } from '../pitch.js';
import { chance, nextRandom } from '../random.js';
import { byStat } from '../stats.js';
import { clamp, distance, segmentGap } from '../vector.js';

const BLOCK_GAP = 16;
const TIGHT_ANGLE = 0.45;
const POINT_BLANK = 90;
// the share of the urge to shoot left with none, one, two and three or more in the way
const BLOCKED = [1, 0.6, 0.35, 0.2];

export const shootRangeOf = (match, player) =>
  match.goal.width * byStat(AI.shootRange, player.stats.shot);

// each outfield opponent in the way of the shot makes the shooter likelier to look for a pass
function blockedOf(match, player, goal) {
  const blockers = match.sides[1 - player.team].filter((opponent) => {
    const { gap, along } = segmentGap(player, goal, opponent);

    return opponent.role !== 'keeper' && along > 0 && along < 1 && gap < BLOCK_GAP;
  });

  return BLOCKED[Math.min(blockers.length, BLOCKED.length - 1)];
}

function shotChanceOf(match, player) {
  const goal = goalOf(match, player.team);
  const gap = distance(player, goal);
  const range = shootRangeOf(match, player);
  const view = Math.abs(goal.x - player.x) / Math.max(gap, 1);

  if (gap > range || (view < TIGHT_ANGLE && gap > POINT_BLANK)) {
    return 0;
  }

  const near = 1 - gap / range;

  return (AI.shootChance + AI.closeShot * near * near) * blockedOf(match, player, goal);
}

// the computer's carrier shoots more the nearer and clearer they are, harder from further out
export function shotOf(match, player) {
  if (!chance(match.random, shotChanceOf(match, player))) {
    return null;
  }

  const gap = distance(player, goalOf(match, player.team));
  const power = clamp(
    0.5 + (gap / shootRangeOf(match, player)) * 0.4 + nextRandom(match.random) * 0.15,
    0.4,
    1,
  );

  return {
    kind: 'shoot',
    power,
    aimY: aimAwayFromKeeper(match, player),
    aimZ: aimHeightOf(match, power),
  };
}
