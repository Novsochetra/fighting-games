import { areasOf, attackSign, goalLineOf, midY, progressOf } from '../pitch.js';
import { ownerOf } from '../squad.js';

const DEEP = 0.7;

// with a mate on the ball in the last third, the forwards attack the near post, the penalty spot and
// the far post, and the middle midfielder arrives at the edge of the box
function spotsOf(match, team, carrier) {
  const { box, goal, penaltySpot } = areasOf(match);
  const line = goalLineOf(match, team);
  const back = -attackSign(team);
  const side = carrier.y < midY(match) ? -1 : 1;

  return {
    near: { x: line + back * 55, y: midY(match) + side * goal.width * 0.4 },
    middle: { x: line + back * penaltySpot * 0.85, y: midY(match) },
    far: { x: line + back * 60, y: midY(match) - side * goal.width * 0.55 },
    edge: { x: line + back * (box.depth + 10), y: midY(match) - side * 40 },
  };
}

const isDeep = (match, carrier) => progressOf(match, carrier.team, carrier.x) > DEEP;

function arrivalOf(player, carrier, spots) {
  const across = player.slot.across;

  if (player.role === 'forward') {
    if (across > 0.4 && across < 0.6) {
      return spots.middle;
    }

    return Math.sign(player.y - carrier.y) === Math.sign(spots.far.y - carrier.y)
      ? spots.far
      : spots.near;
  }

  return player.role === 'midfielder' && across > 0.4 && across < 0.6 ? spots.edge : null;
}

export function arrivalSpot(match, player) {
  const carrier = ownerOf(match);

  if (!carrier || carrier.team !== player.team || !isDeep(match, carrier)) {
    return null;
  }

  return arrivalOf(player, carrier, spotsOf(match, player.team, carrier));
}
