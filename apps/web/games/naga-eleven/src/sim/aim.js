import { midY } from './pitch.js';
import { nextRandom } from './random.js';
import { keeperOf } from './squad.js';

const CORNER = 0.32;
const ACROSS = 0.32;
// a shooter this near the line through the middle of the goal, in goal widths, is in front of it
const CENTRAL = 0.1;

const eitherSide = (match) => (nextRandom(match.random) < 0.5 ? -1 : 1);

export function aimAwayFromKeeper(match, player) {
  const offset = keeperOf(match, 1 - player.team).y - midY(match);
  const side = Math.abs(offset) > 4 ? -Math.sign(offset) : eitherSide(match);

  return midY(match) + side * CORNER * match.goal.width;
}

// across the keeper: to the far post, or from straight in front of the goal to the side the
// keeper leaves open, never at him
function acrossOf(match, player) {
  const offset = midY(match) - player.y;

  if (Math.abs(offset) > CENTRAL * match.goal.width) {
    return Math.sign(offset);
  }

  const keeperOffset = keeperOf(match, 1 - player.team).y - player.y;

  return Math.abs(keeperOffset) > 2 ? -Math.sign(keeperOffset) : eitherSide(match);
}

// up or down on the stick picks a corner; with neither the shot goes across the keeper
export function stickAimY(match, player, stick) {
  const side = stick.y === 0 ? acrossOf(match, player) * ACROSS : Math.sign(stick.y) * CORNER;

  return midY(match) + side * match.goal.width;
}
