import { addImpact } from './impact-list.js';
import { planOf } from './move-plan.js';
import { clearRing } from './ring.js';

// a move's ball is in flight this long at most, and only while it flies this fast and nobody has
// it; when it is over its trail draws in toward the ball for FADE_TICKS
const FLIGHT_TICKS = 150;
const FLYING_SPEED = 2.5;
export const FADE_TICKS = 10;
const STRIKE_SCALE = 0.7;
const FLYING_PHASES = new Set(['play', 'goal', 'saveCam']);

const isHeld = (ball) => ball.owner !== null && ball.owner !== undefined;
const isInGoal = (ball) => ball.inGoal !== null && ball.inGoal !== undefined;
const speedOf = (ball) => Math.hypot(ball.vx ?? 0, ball.vy ?? 0, ball.vz ?? 0);

// a move whose trail follows the ball: from the tick it leaves the foot (after the cut-in, in a
// duel) until someone has it, it is in the net or it dies; `river` is the ground the passes
// before it ran over, for the Mekong Current
export function startFlight(effects, match, { move, player, river = null }) {
  const plan = planOf(move);

  if (!plan?.trail || plan.follows !== 'ball') {
    return false;
  }

  effects.flight = { move, plan, player, born: match.tick, released: null, endedAt: null, river };
  clearRing(effects.trail);

  return true;
}

function release(effects, match) {
  if (isHeld(match.ball) || match.phase === 'duel') {
    return;
  }

  effects.flight.released = match.tick;
  clearRing(effects.trail);
  addImpact(effects, match, { plan: effects.flight.plan, at: match.ball, scale: STRIKE_SCALE });
}

const meetsSomething = (match, events) =>
  isHeld(match.ball) || isInGoal(match.ball) || events.some((event) => event.type === 'save');

const diesOut = (flight, match) =>
  match.tick - flight.released > FLIGHT_TICKS ||
  speedOf(match.ball) < FLYING_SPEED ||
  !FLYING_PHASES.has(match.phase);

function end(effects, match, { impact }) {
  effects.flight.endedAt = match.tick;

  if (impact) {
    addImpact(effects, match, { plan: effects.flight.plan, at: match.ball });
  }
}

export function followFlight(effects, match, events = []) {
  const { flight } = effects;

  if (!flight) {
    return;
  }

  if (flight.endedAt !== null) {
    effects.flight = match.tick - flight.endedAt >= FADE_TICKS ? null : flight;
  } else if (flight.released === null) {
    release(effects, match);
  } else if (meetsSomething(match, events)) {
    end(effects, match, { impact: true });
  } else if (diesOut(flight, match)) {
    end(effects, match, { impact: false });
  }
}

export const isFlying = (effects) =>
  Boolean(effects?.flight && effects.flight.released !== null && effects.flight.endedAt === null);
