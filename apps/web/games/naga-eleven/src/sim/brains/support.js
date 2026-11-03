import { AI } from '../../data/tuning.js';
import { homeSpot } from '../formation.js';
import { opennessOf } from '../passing.js';
import { attackSign, insidePitch, progressOf } from '../pitch.js';
import { ownerOf } from '../squad.js';
import { distance, segmentGap } from '../vector.js';
import { arrivalSpot } from './arrivals.js';
import { startRun } from './runs.js';
import { runTo } from './steering.js';

const STEP = 55;
const OFFSETS = [
  [0, 0],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
];

// a lane is open when no opponent stands near the line from the ball to the spot
function laneOf(match, from, spot, team) {
  let room = 60;

  for (const opponent of match.sides[1 - team]) {
    const { gap, along } = segmentGap(from, spot, opponent);

    if (along > 0.05 && along < 0.95) {
      room = Math.min(room, gap);
    }
  }

  return room / 60;
}

// open, with a clear lane from the ball, at a passing distance, not far from the player's place
// and, for a forward, not beyond the last defender until they make the run
function spotScore(match, player, { spot, home, carrier }) {
  const team = player.team;
  const gap = carrier ? distance(carrier, spot) : 200;
  const reach = gap < 70 ? -0.6 : -Math.max(0, gap - 380) / 400;
  const beyond =
    progressOf(match, team, spot.x) > progressOf(match, team, match.plans[team].lastLine);
  const offside = player.role === 'forward' && beyond ? -0.8 : 0;
  const lane = carrier ? laneOf(match, carrier, spot, team) * 0.8 : 0;

  return (
    Math.min(opennessOf(match, spot, team), 120) / 120 +
    lane +
    reach +
    offside -
    distance(spot, home) / 220
  );
}

function pickSpot(match, player) {
  const home = arrivalSpot(match, player) ?? homeSpot(match, player);
  const carrier = ownerOf(match) ?? match.ball;
  const sign = attackSign(player.team);
  let best = home;
  let bestScore = -Infinity;

  for (const [along, across] of OFFSETS) {
    const spot = insidePitch(
      match,
      { x: home.x + along * STEP * sign, y: home.y + across * STEP },
      15,
    );
    const score = spotScore(match, player, { spot, home, carrier });

    if (score > bestScore) {
      best = spot;
      bestScore = score;
    }
  }

  return best;
}

// each player picks a spot now and then rather than every tick, so they run rather than dither
export function supportIntent(match, player) {
  const fresh = (match.tick + player.index) % AI.spotEvery === 0;

  if (player.run === 0 && !startRun(match, player) && (fresh || !player.spot)) {
    player.spot = pickSpot(match, player);
  }

  return runTo(
    player,
    player.spot,
    player.run > 0 || distance(player, player.spot) > AI.sprintFrom * 2,
  );
}
