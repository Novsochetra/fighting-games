import { movingTicks } from '../sequence.js';
import { CONTACTS, GOAL, GROUND } from '../world.js';
import { bezier, between, easeIn, easeOut, phaseOf } from './ease.js';

const FLOOR = GROUND - 6;

// ticks since the Naga met the goal, the crash's hold not counted: nothing moves while it holds
export function afterTicks(clock) {
  const hold = { at: 0, hold: clock.holds.crash };

  if (clock.stage === 'collision') {
    return movingTicks(clock.ticks, hold);
  }

  return clock.stage === 'aftermath' ? movingTicks(clock.lengths.collision, hold) + clock.ticks : 0;
}

function hopsOn({ land, rest, ticks }) {
  const share = phaseOf(ticks, 0, 60);
  const hop = Math.abs(Math.sin(share * Math.PI * 3)) * 12 * (1 - share) ** 2;

  return { x: land.x + (rest.x - land.x) * easeOut(share), y: FLOOR - hop };
}

function arcThenRoll({ from, control, land, rest, flight }, ticks) {
  if (ticks < flight) {
    return bezier(from, control, land, easeOut(ticks / flight));
  }

  return hopsOn({ land, rest, ticks: ticks - flight });
}

const NET_BACK = { x: GOAL.line + GOAL.depth - 8, y: GROUND - 40 };

function intoNet(ticks) {
  if (ticks < 10) {
    return between(CONTACTS.goal, NET_BACK, easeOut(ticks / 10));
  }

  const drop = phaseOf(ticks, 10, 22);

  return { x: NET_BACK.x - drop * 4, y: NET_BACK.y + (FLOOR - NET_BACK.y) * easeIn(drop) };
}

const AWAY = {
  punch: {
    from: CONTACTS.punch,
    control: { x: 556, y: GROUND - 170 },
    land: { x: 488, y: FLOOR },
    rest: { x: 430, y: FLOOR },
    flight: 40,
  },
  parry: {
    from: CONTACTS.parry,
    control: { x: 590, y: GROUND - 30 },
    land: { x: 580, y: FLOOR },
    rest: { x: 520, y: FLOOR },
    flight: 10,
  },
  post: {
    from: CONTACTS.post,
    control: { x: 604, y: GROUND - 120 },
    land: { x: 556, y: FLOOR },
    rest: { x: 500, y: FLOOR },
    flight: 30,
  },
};

// where the ball goes once the Naga has met the goal; a caught ball is held, so it goes where the
// keeper's gloves go (keeperAt), and this gives null
export function ballAfter(ending, ticks) {
  if (ending === 'goal') {
    return intoNet(ticks);
  }

  return AWAY[ending] ? arcThenRoll(AWAY[ending], ticks) : null;
}

export const FLOOR_Y = FLOOR;
