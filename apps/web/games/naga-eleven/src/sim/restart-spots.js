import { defensivePlaceOf } from './brains/defending.js';
import { cornerSpotOf } from './corner-spots.js';
import { homeSpot } from './formation.js';
import { attackSign, insidePitch } from './pitch.js';
import { outfieldOf } from './squad.js';
import { distance } from './vector.js';

// how far the other side must stand from the ball
const KEEP_AWAY = { throwIn: 40, corner: 110, goalKick: 180 };
const OFFER = [
  { along: 70, infield: 50 },
  { along: -40, infield: 90 },
];

export function takerSpotOf(match) {
  const { restart, pitch } = match;
  const outward = (value, edge) => (value === 0 ? -edge : pitch.width + edge);

  if (restart.kind === 'throwIn') {
    return { x: restart.x, y: outward(restart.y, 6) };
  }

  if (restart.kind === 'corner') {
    return { x: restart.x + (restart.x === 0 ? -8 : 8), y: outward(restart.y, 8) };
  }

  return { x: restart.x - attackSign(restart.team) * 14, y: restart.y };
}

// at a throw-in the two mates nearest come to the line for it, one down it, one infield
function offerSpot(match, player) {
  const { restart } = match;
  const mates = outfieldOf(match, restart.team).filter((mate) => mate.index !== restart.taker);
  const rank = mates
    .sort((first, second) => distance(first, restart) - distance(second, restart))
    .slice(0, OFFER.length)
    .indexOf(player);

  if (restart.kind !== 'throwIn' || rank < 0) {
    return null;
  }

  const { along, infield } = OFFER[rank];
  const inward = restart.y === 0 ? 1 : -1;
  const spot = { x: restart.x + attackSign(restart.team) * along, y: restart.y + inward * infield };

  return insidePitch(match, spot, 10);
}

function keepAway(match, player, spot) {
  const { restart } = match;
  const least = KEEP_AWAY[restart.kind];
  const gap = distance(spot, restart);

  if (player.team === restart.team || gap >= least) {
    return spot;
  }

  const away = gap > 0 ? least / gap : 1;

  return insidePitch(match, {
    x: restart.x + (spot.x - restart.x) * away,
    y: restart.y + (spot.y - restart.y) * away,
  });
}

function placeOf(match, player) {
  const plan = match.plans[player.team];
  const corner = match.restart.kind === 'corner' ? cornerSpotOf(match, player) : null;

  if (corner) {
    return corner;
  }

  if (player.team === match.restart.team) {
    return offerSpot(match, player) ?? homeSpot(match, player);
  }

  return player.role === 'keeper' ? homeSpot(match, player) : defensivePlaceOf(match, player, plan);
}

export const restartSpotOf = (match, player) => keepAway(match, player, placeOf(match, player));
