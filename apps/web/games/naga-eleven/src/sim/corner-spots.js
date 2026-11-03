import { kickerOf } from './formation.js';
import { areasOf, attackSign, goalLineOf, midY, xAtProgress } from './pitch.js';
import { outfieldOf } from './squad.js';

const MARK_GAP = 14;
const BIG_DEFENDERS_11 = [2, 3];

// the spots in the box a corner is aimed at, the near post first
function targetsOf(match, team) {
  const { box, goal, goalArea, penaltySpot } = areasOf(match);
  const line = goalLineOf(match, team);
  const back = -attackSign(team);
  const near = match.restart.y < midY(match) ? -1 : 1;
  const at = (depth, across) => ({ x: line + back * depth, y: midY(match) + near * across });

  return [
    at(goalArea.depth * 0.7, goal.width * 0.4),
    at(goalArea.depth * 0.9, -goal.width * 0.6),
    at(penaltySpot, 0),
    at(goalArea.depth * 1.1, goal.width * 0.05),
    at(box.depth + 15, -box.width * 0.15),
    at(penaltySpot * 1.1, -goal.width),
  ];
}

// the forwards go up, then the midfielders, then in 11 v 11 the two centre backs
export function cornerGoers(match, team) {
  const taker = match.restart.taker;
  const outfield = outfieldOf(match, team).filter((player) => player.index !== taker);
  const big = (player) => match.format === '11' && BIG_DEFENDERS_11.includes(player.slotIndex);

  return [
    ...outfield.filter((player) => player.role === 'forward'),
    ...outfield.filter((player) => player.role === 'midfielder'),
    ...outfield.filter(big),
  ].slice(0, targetsOf(match, team).length);
}

function attackingSpot(match, player) {
  const rank = cornerGoers(match, player.team).indexOf(player);

  return rank < 0 ? null : targetsOf(match, player.team)[rank];
}

// the defenders each stand goal side of one who came up, the striker waits up the pitch for
// the clearance and the keeper keeps the line
function defendingSpot(match, player) {
  const attackers = 1 - player.team;
  const line = goalLineOf(match, attackers);
  const back = -attackSign(attackers);

  if (player.role === 'keeper') {
    return { x: line + back * 8, y: midY(match) };
  }

  if (player === kickerOf(match, player.team)) {
    return { x: xAtProgress(match, player.team, 0.45), y: midY(match) };
  }

  const markers = outfieldOf(match, player.team).filter(
    (other) => other !== kickerOf(match, player.team),
  );
  const target = targetsOf(match, attackers)[markers.indexOf(player)];

  return target ? { x: target.x + back * MARK_GAP, y: target.y } : null;
}

export const cornerSpotOf = (match, player) =>
  player.team === match.restart.team ? attackingSpot(match, player) : defendingSpot(match, player);
