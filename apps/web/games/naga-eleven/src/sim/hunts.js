import { TICKS_PER_SECOND } from '../config.js';
import { canRun } from './chasers.js';
import { pairKey } from './duel/geometry.js';
import { areasOf } from './pitch.js';
import { outfieldOf } from './squad.js';
import { distance } from './vector.js';

// a share of the pitch's length: from further off the rival leaves the star to his side's shape
const HUNT_REACH = 0.3;
// a share of a full match's play: a rival who hunted the star all match was out of his side's play
// for most of it, and still met him in none of some, as the star had no ball to meet him with; by
// two fifths of the way nearly all have met. A short match gives the star the ball no more often,
// so it keeps the same time, though never past half of it
const HUNT_SHARE = 0.4;
const MOST_SHARE = 0.5;
// in world units: a loose ball this near the star is the hunter's to go for, so the two meet over
// it, as the star gets the ball too seldom for a hunter who only waits for him to have it
const BALL_REACH = 200;

export const playedTicksOf = (match) =>
  (match.half - 1) * match.halfTicks + match.halfTicks - match.clock;

export function huntTicksOf(match) {
  const fullTicks = 2 * areasOf(match).halfSeconds * TICKS_PER_SECOND;

  return Math.min(fullTicks * HUNT_SHARE, 2 * match.halfTicks * MOST_SHARE);
}

const quarryOf = (match, hunter) =>
  hunter.hunts
    ? (outfieldOf(match, 1 - hunter.team).find((player) => player.star === hunter.hunts) ?? null)
    : null;

const haveMet = (match, hunter, quarry) =>
  match.duelMemory?.pairs?.[pairKey(hunter, quarry)] !== undefined;

function isHunting(match, hunter, quarry) {
  return (
    Boolean(quarry) &&
    canRun(hunter) &&
    !haveMet(match, hunter, quarry) &&
    playedTicksOf(match) < huntTicksOf(match) &&
    distance(hunter, quarry) < match.pitch.length * HUNT_REACH
  );
}

// a rival whose table names a star he hunts (`hunts`: the star's character id) seeks that star out
// whenever the star is near, in the first part of the match until the two have met in a duel, as
// the rivals of the old football anime did: { hunter, quarry } as player indexes, or null
export function huntOf(match, team) {
  for (const hunter of outfieldOf(match, team)) {
    const quarry = quarryOf(match, hunter);

    if (isHunting(match, hunter, quarry)) {
      return { hunter: hunter.index, quarry: quarry.index };
    }
  }

  return null;
}

export const goesForBall = (match, hunt) =>
  Boolean(hunt) &&
  match.ball.owner === null &&
  distance(match.ball, match.players[hunt.quarry]) < BALL_REACH;
