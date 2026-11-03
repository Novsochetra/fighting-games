import { TACKLE } from '../data/tuning.js';
import { pushEvent } from './events.js';
import { inBoxOf } from './pitch.js';
import { chance, nextRandom } from './random.js';
import { beatMan, isBursting } from './skills/dribble.js';
import { tackleLiftOf } from './skills/tackle.js';
import { gainSpirit } from './spirit.js';
import { ownerOf } from './squad.js';
import { tackleOddsOf } from './stats.js';
import { distance } from './vector.js';

const STANDING_ODDS = 0.85;
const MISSED_SLIDE_STUN = 18;
const BEATEN_STUN = 8;

export const holdsSafely = (match, player) =>
  player.role === 'keeper' && inBoxOf(match, player.team, player);

export function startTackle(match, player) {
  if (player.recover > 0 || player.stun > 0 || match.ball.owner === player.index) {
    return;
  }

  player.tackle = TACKLE.ticks;
  player.recover = TACKLE.recoverTicks;
  player.vx = player.facing.x * TACKLE.speed;
  player.vy = player.facing.y * TACKLE.speed;
}

function knockLoose(match, carrier, tackler) {
  Object.assign(match.ball, {
    owner: null,
    vx: tackler.facing.x * TACKLE.knock,
    vy: tackler.facing.y * TACKLE.knock + (nextRandom(match.random) - 0.5),
    vz: 1,
    lastTouch: tackler.index,
    kick: null,
  });
  carrier.stun = TACKLE.stunTicks;
  carrier.noPickup = TACKLE.stunTicks;
  carrier.charge = 0;
  carrier.charging = null;
}

// a tackle skill fires as he goes in; a carrier in a dribble skill's burst is never caught; who
// comes out of it with the ball has his gauge filled
function contest(match, tackler, carrier, odds) {
  const lifted = Math.min(odds + tackleLiftOf(match, tackler), TACKLE.oddsRange[1]);
  const won = !isBursting(carrier) && chance(match.random, lifted);

  carrier.respite = TACKLE.respiteTicks;
  pushEvent(match, { type: 'tackle', player: tackler.index, target: carrier.index, won });

  if (won) {
    gainSpirit(match, tackler, 'tackle');
  } else {
    beatMan(match, carrier);
  }

  return won;
}

// a slide that reaches the ball wins it or misses and leaves the slider on the grass; a keeper
// holding it in their box is never tackled
export function resolveTackles(match) {
  const carrier = ownerOf(match);

  if (!carrier || holdsSafely(match, carrier)) {
    return;
  }

  const slider = match.sides[1 - carrier.team].find(
    (player) => player.tackle > 0 && distance(player, match.ball) < TACKLE.reach,
  );

  if (!slider) {
    return;
  }

  if (contest(match, slider, carrier, tackleOddsOf(slider, carrier))) {
    knockLoose(match, carrier, slider);
  } else {
    Object.assign(slider, { tackle: 0, stun: MISSED_SLIDE_STUN });
  }
}

function winOnFeet(match, challenger, carrier) {
  carrier.stun = BEATEN_STUN;
  carrier.noPickup = TACKLE.stunTicks;
  carrier.charge = 0;
  carrier.charging = null;
  Object.assign(match.ball, { owner: challenger.index, lastTouch: challenger.index, kick: null });
  challenger.holding = 0;
}

// a tackle on the feet: it takes the ball off the carrier, or the carrier rides it and the
// tackler is left a step behind
export function challenge(match, player) {
  const carrier = ownerOf(match);
  const near = carrier && distance(player, match.ball) < TACKLE.challengeReach;

  if (!near || player.recover > 0 || carrier.team === player.team || holdsSafely(match, carrier)) {
    return;
  }

  if (contest(match, player, carrier, tackleOddsOf(player, carrier) * STANDING_ODDS)) {
    winOnFeet(match, player, carrier);
  } else {
    Object.assign(player, { recover: TACKLE.challengeRecover, stun: BEATEN_STUN });
  }
}
