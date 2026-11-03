import { KEEPER, KICK } from '../data/tuning.js';
import { spendChain } from './combos/chains.js';
import { comboLiftOf, spendCombo } from './combos/pass-combo.js';
import { pushEvent } from './events.js';
import { groundSpeedFor, liftFor, loftFor, loftTicksFor } from './flight.js';
import { goalLineOf } from './pitch.js';
import { nextRandom, wobble } from './random.js';
import { passSpreadOf, passWeightOf, shotSpeedOf, shotSpreadOf } from './stats.js';
import { clamp, directionTo, distance, lerp, normalized } from './vector.js';

export function release(match, player, { direction, speed, lift, kind }) {
  Object.assign(match.ball, {
    owner: null,
    vx: direction.x * speed,
    vy: direction.y * speed,
    vz: lift,
    lastTouch: player.index,
    kick: kind,
    move: null,
    skillPass: null,
  });
  Object.assign(player, {
    noPickup: KICK.noPickupTicks,
    holding: 0,
    charge: 0,
    charging: null,
    lastKick: match.tick,
  });
}

// a ball leaves the foot a little off its line, a poor kicker's further
function skewed(match, direction, spread) {
  const turn = wobble(match.random, spread);

  return normalized(direction.x - direction.y * turn, direction.y + direction.x * turn);
}

// strikes the ball for a spot, along the grass or in the air coming down to `height` there after
// `flight` ticks (a long ball's own time when none is given)
export function kickTo(match, player, { spot, lofted = false, height = 0, kind = 'pass', flight }) {
  const weight = passWeightOf(player);
  const gap = distance(match.ball, spot) * (1 + wobble(match.random, weight));
  const spread = passSpreadOf(player) * (lofted ? KICK.loftSpread : 1);
  const direction = skewed(match, directionTo(match.ball, spot), spread);
  const ticks = flight ?? loftTicksFor(gap);
  const strike = lofted
    ? loftFor(gap, ticks, height - match.ball.z)
    : { speed: groundSpeedFor(gap), lift: 0 };

  release(match, player, { direction, ...strike, kind });

  return lofted ? ticks : gap / strike.speed;
}

// aimed at a spot of the goal mouth (aimY across it, aimZ up it), off by the shooter's skill; a
// skill's shot (`move`) flies faster and truer, and the holder of a pass combo's is lifted by it.
// Any shot spends his side's combo and the chain he was to finish
export function strikeAtGoal(
  match,
  player,
  { power, aimY, aimZ, pace = 1, spreadShare = 1, move = null },
) {
  const { goal } = match;
  const lift = comboLiftOf(match, player);
  const spread = shotSpreadOf(player) * (0.4 + 0.6 * power) * spreadShare;
  const target = {
    x: goalLineOf(match, player.team),
    y: aimY + wobble(match.random, spread * goal.width),
  };
  const height = clamp(aimZ + wobble(match.random, spread * goal.height), 0, goal.height * 2);
  const speed = shotSpeedOf(player, power) * pace * (1 + lift.speed);
  const rise = liftFor(speed, distance(match.ball, target), height);

  release(match, player, {
    direction: directionTo(match.ball, target),
    speed,
    lift: rise,
    kind: 'shot',
  });
  match.ball.move = move;
  match.ball.read = wobble(match.random, KEEPER.readSpread);
  match.lastShot = { shooter: player.index, move, level: lift.level, tick: match.tick };
  spendCombo(match, player);
  spendChain(match, player);
  pushEvent(match, { type: 'shot', player: player.index, power, move });
}

// a harder shot rises more, so it is likelier to fly over
export const aimHeightOf = (match, power) =>
  lerp(4, match.goal.height * 0.75, power) * (0.6 + 0.4 * nextRandom(match.random));

export function shootBall(match, player, { power, aimY, aimZ }) {
  if (match.ball.owner !== player.index) {
    return;
  }

  strikeAtGoal(match, player, { power, aimY, aimZ: aimZ ?? aimHeightOf(match, power) });
}
