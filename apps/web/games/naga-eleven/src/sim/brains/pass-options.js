import { AI, KICK, PLAYER } from '../../data/tuning.js';
import { groundSpeedFor, loftTicksFor } from '../flight.js';
import { leadOf, opennessOf } from '../passing.js';
import { inBoxOf, insidePitch, progressOf } from '../pitch.js';
import { teammatesOf } from '../squad.js';
import { runSpeedOf, sprintSpeedOf } from '../stats.js';
import { clamp, directionTo, distance, segmentGap } from '../vector.js';

const NEAREST = 45;
const SAFE_TICKS = 24;
const LOFT_FROM = 160;
const RUN_LEAD = 55;
const TAKE_OFF = 45;
// the share of the ball's time on its way an opponent beside the line has to step across it
const LANE_REACH = 0.5;

const ticksToReach = (player, spot, pace) =>
  Math.max(0, distance(player, spot) - PLAYER.reach) / pace;

// a pass is safe when the mate gets to the spot, and the ball does, well before any opponent
function spotSafety(match, { mate, spot, ballTicks }) {
  const arrive = Math.max(ballTicks, ticksToReach(mate, spot, runSpeedOf(mate)));
  const foes = match.sides[1 - mate.team].map((foe) => ticksToReach(foe, spot, sprintSpeedOf(foe)));

  return clamp((Math.min(...foes) - arrive) / SAFE_TICKS + 0.5, 0, 1);
}

// along the grass the opponents near its line can step across it while it rolls, the further
// along the longer they have
function laneSafety(match, { mate, spot, ballTicks }) {
  let worst = 1;

  for (const foe of match.sides[1 - mate.team]) {
    const { gap, along } = segmentGap(match.ball, spot, foe);
    const room = PLAYER.reach + sprintSpeedOf(foe) * along * ballTicks * LANE_REACH;

    worst = Math.min(worst, gap / room);
  }

  return worst;
}

// a ball in the air is still low as it leaves the foot: an opponent close in front blocks it
function takeOffSafety(match, { mate, spot }) {
  const span = distance(match.ball, spot);
  const blocker = match.sides[1 - mate.team].find((foe) => {
    const { gap, along } = segmentGap(match.ball, spot, foe);

    return along * span < TAKE_OFF && gap < PLAYER.reach * 1.4;
  });

  return blocker ? 0 : 1;
}

function safetyOf(match, pass) {
  const spot = spotSafety(match, pass);
  const path = pass.lofted ? takeOffSafety(match, pass) : laneSafety(match, pass);

  return Math.min(spot, path);
}

// a runner is passed to into the space ahead of them
function spotFor(match, mate) {
  const spot = leadOf(match, mate, match.ball);

  if (mate.run === 0 || !mate.spot) {
    return spot;
  }

  const way = directionTo(mate, mate.spot);

  return insidePitch(match, { x: spot.x + way.x * RUN_LEAD, y: spot.y + way.y * RUN_LEAD }, 15);
}

function ballTicksOf(gap, lofted) {
  if (lofted) {
    return loftTicksFor(gap);
  }

  return gap / ((groundSpeedFor(gap) + KICK.passArrival) / 2);
}

function passOf(match, mate) {
  const spot = spotFor(match, mate);
  const gap = distance(match.ball, spot);
  const ground = { mate, spot, gap, lofted: false, ballTicks: ballTicksOf(gap, false) };
  const groundSafety = gap > KICK.groundReach ? 0 : safetyOf(match, ground);

  if (groundSafety >= AI.passSafety || gap < LOFT_FROM) {
    return { ...ground, safety: groundSafety };
  }

  const air = { mate, spot, gap, lofted: true, ballTicks: ballTicksOf(gap, true) };

  return { ...air, safety: safetyOf(match, air) };
}

function optionFor(match, carrier, mate) {
  const pass = passOf(match, mate);
  const { spot, gap, lofted, safety } = pass;

  if (gap < NEAREST || gap > KICK.loftReach[1] || mate.stun > 0 || safety < AI.passSafety) {
    return null;
  }

  const gain = progressOf(match, carrier.team, spot.x) - progressOf(match, carrier.team, carrier.x);
  const open = Math.min(opennessOf(match, spot, carrier.team), 120) / 120;
  const bonus = (mate.run > 0 ? 0.35 : 0) + (inBoxOf(match, 1 - carrier.team, spot) ? 0.25 : 0);
  const value = gain * 3 + open * 0.6 + safety - (lofted ? 0.3 : 0) - gap / 2500 + bonus;

  return { target: mate.index, spot, lofted, value };
}

// the best pass the carrier has, or null when none is safe; a keeper is passed back to only
// from the team's own half
export function bestPassOf(match, carrier) {
  let best = null;

  for (const mate of teammatesOf(match, carrier)) {
    const backPass = mate.role === 'keeper' && progressOf(match, carrier.team, carrier.x) > 0.4;
    const option = backPass ? null : optionFor(match, carrier, mate);

    if (option && (!best || option.value > best.value)) {
      best = option;
    }
  }

  return best;
}
