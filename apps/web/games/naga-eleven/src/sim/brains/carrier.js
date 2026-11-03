import { AI } from '../../data/tuning.js';
import { attackSign, insidePitch, midY, progressOf } from '../pitch.js';
import { chance } from '../random.js';
import { nearestTo, opponentsOf } from '../squad.js';
import { distance } from '../vector.js';
import { burstDecision, duoPassDecision, withSkillPass, withSkillShot } from './carrier-skills.js';
import { crossOf } from './crossing.js';
import { dribbleWayOf, roomAheadOf } from './dribbling.js';
import { bestPassOf } from './pass-options.js';
import { shotOf } from './shooting.js';
import { kick } from './steering.js';

const CLEAR_DISTANCE = 360;
const DEEP_IN_OWN_HALF = 0.3;

// cleared long and toward the nearer touchline, away from the middle of the pitch
function clearanceOf(match, player) {
  const sign = attackSign(player.team);
  const side = player.y < midY(match) ? -1 : 1;
  const spot = { x: player.x + sign * CLEAR_DISTANCE, y: player.y + side * CLEAR_DISTANCE * 0.5 };

  return { kind: 'clear', spot: insidePitch(match, spot, 30) };
}

// under pressure the carrier looks for a pass often, in space now and then; a pass is played
// when it beats running on with the ball
function passOf(match, player) {
  const threat = nearestTo(opponentsOf(match, player), player);
  const pressed = distance(threat, player) < AI.pressure;

  if (!chance(match.random, pressed ? AI.passChance : AI.calmPassChance)) {
    return null;
  }

  const option = bestPassOf(match, player);

  if (option && option.value > 0.5 + roomAheadOf(match, player)) {
    const pass = { kind: 'pass', target: option.target, spot: option.spot, lofted: option.lofted };

    return withSkillPass(match, player, pass);
  }

  const deep = progressOf(match, player.team, player.x) < DEEP_IN_OWN_HALF;

  return pressed && deep && !option ? clearanceOf(match, player) : null;
}

function crossDecision(match, player) {
  const cross = crossOf(match, player);

  return cross ? withSkillPass(match, player, cross) : null;
}

function decisionOf(match, player) {
  const shot = shotOf(match, player);

  if (shot) {
    return withSkillShot(match, player, shot);
  }

  if (player.holding < AI.firstTouchTicks) {
    return null;
  }

  return duoPassDecision(match, player) ?? crossDecision(match, player) ?? passOf(match, player);
}

export function carrierIntent(match, player) {
  const decision = decisionOf(match, player);

  if (decision) {
    return kick(decision);
  }

  const room = roomAheadOf(match, player);
  const burst = burstDecision(match, player);

  return {
    move: dribbleWayOf(match, player),
    sprint: Boolean(burst) || (room > 0.6 && player.energy > 0.4),
    action: burst,
  };
}
