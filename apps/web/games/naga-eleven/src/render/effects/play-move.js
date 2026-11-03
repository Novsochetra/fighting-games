import { addImpact } from './impact-list.js';
import { startCarry } from './carries.js';
import { startFlight } from './flight.js';
import { planOf } from './move-plan.js';
import { passesOf } from './passes.js';

const WALL_AHEAD = 14;

function riverFor(match, { plan, player, passes }) {
  const shooter = match.players[player];

  if (plan.trail !== 'river' || !shooter) {
    return null;
  }

  return [...(passes ?? []), { x: shooter.x, y: shooter.y, z: 0 }];
}

// the wall rises between the blocker and the ball
function wallPlace(player, ball) {
  const reach = Math.hypot(ball.x - player.x, ball.y - player.y) || 1;

  return {
    x: player.x + ((ball.x - player.x) / reach) * WALL_AHEAD,
    y: player.y + ((ball.y - player.y) / reach) * WALL_AHEAD * 0.5,
  };
}

// a block bursts where the blocker stands; a save waits for the ball to meet the keeper
function standAndMeet(effects, match, { plan, player }) {
  const man = match.players[player];

  if (!man) {
    return;
  }

  if (plan.move.play === 'block') {
    addImpact(effects, match, {
      plan,
      at: { x: man.x, y: man.y, z: 14 },
      place: wallPlace(man, match.ball),
    });
  } else {
    effects.guard = { keeper: player, plan, born: match.tick };
  }
}

// what a move does on the pitch as it plays: its ball flies with its trail, or he carries it, or
// it stands where he is
export function playMove(effects, match, { player, move, passes = null }) {
  const plan = planOf(move);

  if (!plan) {
    return;
  }

  const river = riverFor(match, {
    plan,
    player,
    passes: passes ?? passesOf(effects, match, player),
  });

  if (!startFlight(effects, match, { move, player, river })) {
    if (!startCarry(effects, match, { move, player })) {
      standAndMeet(effects, match, { plan, player });
    }
  }
}

// a keeper's save skill bursts where the ball meets him; a move's ball that he stops ends there
export function meetKeeper(effects, match, keeper) {
  const { guard, flight } = effects;

  if (flight && flight.endedAt === null) {
    flight.released ??= match.tick;
    flight.endedAt = match.tick;
    addImpact(effects, match, { plan: flight.plan, at: match.ball });
  }

  if (guard?.keeper === keeper) {
    addImpact(effects, match, { plan: guard.plan, at: match.ball });
    effects.guard = null;
  }
}
