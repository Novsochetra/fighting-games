import { AI } from '../data/tuning.js';
import { interceptOf } from './brains/steering.js';
import { isLoose } from './loose-ball.js';
import { inBoxOf } from './pitch.js';
import { nearestTo, outfieldOf } from './squad.js';
import { distance } from './vector.js';

export const canRun = (player) => player.stun === 0 && player.tackle === 0;

// where a pass on its way to one of the other side's players is to be met, out of the team's own
// box: in it every ball is attacked, as a cross must be
function theirMeetOf(match, team) {
  const receiver = match.sides[1 - team].find((player) => player.receiving > 0);
  const meet = receiver ? interceptOf(match, receiver) : null;

  return meet && !inBoxOf(match, team, meet) ? meet : null;
}

// a pass on its way to one of theirs is gone for only by a defender who gets there clearly first
// or who stands on the spot already: one who races the receiver for it and loses has left him
// alone with it, so he marks him instead and closes him down as it arrives
function contests(player, reach, meet) {
  return (
    !meet || reach.ticks + AI.contestTicks <= meet.ticks || distance(player, meet) < AI.contestReach
  );
}

const isFlying = (ball) => ball.z > 0 || ball.vz > 0;

// a long ball to one of theirs is gone up for by the defender nearest where it comes down too: in
// the air a man beside the receiver has as good a chance at it as he has
function jumperOf(match, runners, meet) {
  return meet && isFlying(match.ball) ? nearestTo(runners, meet) : null;
}

// with a loose ball one of the player's side the computer runs always goes for it, whoever the
// player steers: a side that left it to the man the player was steering lost nearly every one
function runnersOf(match, team) {
  const runners = outfieldOf(match, team).filter(canRun);
  const human = team === match.humanTeam && isLoose(match);

  return human ? runners.filter((player) => player.index !== match.controlled) : runners;
}

function fastestContenderOf(match, team) {
  const meet = theirMeetOf(match, team);
  const runners = runnersOf(match, team);
  const jumper = jumperOf(match, runners, meet);
  let best = null;

  for (const player of runners) {
    const reach = interceptOf(match, player);
    const goes = player === jumper || contests(player, reach, meet);

    if (goes && (!best || reach.ticks < best.ticks)) {
      best = { player, ticks: reach.ticks };
    }
  }

  return best?.player.index ?? null;
}

// the receiver of a pass goes to meet it; with a loose ball whoever gets there first
export function chaserOf(match, team) {
  const receiver = outfieldOf(match, team).find((player) => player.receiving > 0);

  return receiver ? receiver.index : fastestContenderOf(match, team);
}
