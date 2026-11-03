import { SKILL_PLAY } from '../../data/skills.js';
import { FADE_TICKS } from './flight.js';
import { addImpact } from './impact-list.js';
import { planOf } from './move-plan.js';
import { createRing, pushPoint } from './ring.js';

// a move the player carries (a dribble, a tackle) trails him for its burst, from the tick play
// goes on (after the cut-in, when it was picked in a duel)
const CARRY_TICKS = { dribble: SKILL_PLAY.dribble.ticks, tackle: 24 };
const RING = 16;
const MOST = 4;

export function startCarry(effects, match, { move, player }) {
  const plan = planOf(move);

  if (!plan?.trail || plan.follows !== 'player' || !match.players[player]) {
    return false;
  }

  effects.carries = effects.carries.filter((carry) => carry.player !== player).slice(1 - MOST);
  effects.carries.push({
    player,
    plan,
    started: null,
    endedAt: null,
    ticks: CARRY_TICKS[plan.move.play] ?? CARRY_TICKS.tackle,
    ring: createRing(RING),
  });

  return true;
}

function begin(carry, { effects, match, player }) {
  carry.started = match.tick;
  addImpact(effects, match, { plan: carry.plan, at: { x: player.x, y: player.y, z: 0 } });
}

function follow(carry, { effects, match }) {
  const player = match.players[carry.player];

  if (carry.started === null && match.phase === 'play' && player) {
    begin(carry, { effects, match, player });
  }

  if (carry.started === null || carry.endedAt !== null) {
    return;
  }

  pushPoint(carry.ring, player);

  if (match.tick - carry.started >= carry.ticks) {
    carry.endedAt = match.tick;
  }
}

export function followCarries(effects, match) {
  for (const carry of effects.carries) {
    follow(carry, { effects, match });
  }

  effects.carries = effects.carries.filter(
    (carry) => carry.endedAt === null || match.tick - carry.endedAt < FADE_TICKS,
  );
}

// how far the carry has faded, 0 while it runs
export const carryFade = (carry, tick) =>
  carry.endedAt === null ? 0 : Math.min(1, (tick - carry.endedAt) / FADE_TICKS);
