import { addBurst } from './bursts.js';
import { strikeTarget } from './strike.js';

// ticks a cut flares white as it is cut, before it settles to gold
export const CUT_FLARE_TICKS = 5;
// ticks a cut flares white and widens once it lands, before it is gone
export const SEVER_TICKS = 8;
// a cut nothing lands is gone after this long
const CUT_LIFE = 600;
const BODY_HEIGHT = 18;

// a cut of gold left hanging on a raider the hero cut through, along `angle` and bowing out `bow`
// (1 or -1) the way his swing went; it rides the raider where it stands and lands only when the
// ultimate says so
export function hangCut(game, { target, angle, bow, color, offset }) {
  game.summons.push({
    kind: 'hangingCut',
    target,
    x: target.x,
    y: target.y - BODY_HEIGHT * target.scale,
    offset,
    angle,
    bow,
    color,
    side: 'player',
    time: 0,
    severedAt: null,
  });
}

function rideTarget(cut) {
  const { target } = cut;
  if (!target.removed) {
    cut.x = target.x + cut.offset[0];
    cut.y = target.y - BODY_HEIGHT * target.scale + cut.offset[1];
  }
}

export function updateHangingCut(_game, cut) {
  if (cut.severedAt === null) {
    rideTarget(cut);
  }
  const severed = cut.severedAt !== null && cut.time >= cut.severedAt + SEVER_TICKS;
  cut.done = severed || cut.time >= CUT_LIFE;
}

// the cut lands: it strikes its raider with the dav, from the side the hero stands, and bursts in a
// crescent sweeping away from him
export function severCut(game, cut, { from, move }) {
  cut.severedAt = cut.time;
  const { target } = cut;
  const direction = target.x >= from.x ? 1 : -1;
  strikeTarget(game, { x: from.x, direction, side: 'player' }, { target, move });
  addBurst(game, {
    sprite: 'sever',
    x: cut.x,
    y: cut.y,
    scale: 0.8,
    direction,
  });
}
