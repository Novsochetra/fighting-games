import { KEEPER_SPOT } from '../world.js';
import { afterTicks } from './after.js';
import { clamp01, easeIn, easeOut, phaseOf } from './ease.js';

// the dive sheet's frames: 0 set, 1 crouch, 2 push, 3 to 5 flying, 6 and 7 down on the grass; he
// is at the top of his flight (frame 3) as the Naga meets him, but a goal beats him, so he goes late
const FRAME_TICKS = 9;

const LATE = { goal: 8 };

// lifted to meet the ball: CONTACTS in world.js puts each save's ball at his gloves here
const LIFT = { catch: 18, punch: 24, parry: 12, goal: 8, post: 4 };

const GLOVES = { across: 24, up: 24, upLying: 8 };

const SET = 0.55;

const BEFORE = ['awakening', 'charge', 'manifest', 'impact', 'flight'];

// how far into the dive, in ticks from the top of his flight; the keeper's stage leads up to it
function sinceTop(clock, ending) {
  if (clock.stage === 'keeper') {
    return -FRAME_TICKS * 3 * (1 - phaseOf(clock.share, SET, 1 - SET));
  }

  return afterTicks(clock) - (LATE[ending] ?? 0);
}

const frameOf = (since) => Math.max(0, Math.min(7, 3 + Math.floor(since / FRAME_TICKS)));

function bodyOf(since, ending) {
  const lift = LIFT[ending] ?? 10;
  const rising = easeOut(phaseOf(since, -FRAME_TICKS, FRAME_TICKS));
  const falling = easeIn(phaseOf(since, 0, FRAME_TICKS * 3));
  const reach =
    since < 0 ? 8 * clamp01(1 + since / (FRAME_TICKS * 3)) : 8 + 10 * easeOut(since / 36);

  return {
    x: KEEPER_SPOT.x - reach,
    y: KEEPER_SPOT.y - Math.round(lift * rising * (1 - falling)),
    down: phaseOf(since, FRAME_TICKS * 2, FRAME_TICKS),
  };
}

export function keeperAt(clock, ending) {
  const lit = litOf(clock);

  if (BEFORE.includes(clock.stage)) {
    return { ...KEEPER_SPOT, animation: 'idle', frame: 0, direction: 'west', lit, hands: null };
  }

  const since = sinceTop(clock, ending);
  const body = bodyOf(since, ending);
  const up = GLOVES.up + (GLOVES.upLying - GLOVES.up) * body.down;

  return {
    x: Math.round(body.x),
    y: body.y,
    animation: since <= -FRAME_TICKS * 3 ? 'idle' : 'dive',
    frame: frameOf(since),
    direction: 'west',
    lit,
    hands: { x: body.x - GLOVES.across, y: body.y - up },
  };
}

const LIGHT = {
  flight: (clock) => clock.share * 0.4,
  keeper: (clock) => 0.4 + clock.share * 0.6,
  collision: (clock) => 1 - phaseOf(clock.ticks, 10, 34) * 0.6,
  aftermath: (clock) => 0.4 * (1 - phaseOf(clock.share, 0, 0.4)),
};

export const litOf = (clock) => LIGHT[clock.stage]?.(clock) ?? 0;
