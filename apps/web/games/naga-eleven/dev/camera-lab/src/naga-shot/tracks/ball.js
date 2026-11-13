import { BALL_REST } from '../world.js';
import { ballAfter, afterTicks } from './after.js';
import { easeOut, phaseOf } from './ease.js';
import { flightPoint, flightShare, LIFT } from './flight.js';
import { keeperAt } from './keeper.js';
import { playerAt, RUN_SHARE } from './player.js';

// the ball hovers on the Naga's breath once lifted, a pixel up and down
const bob = (ticks) => (Math.floor(ticks / 10) % 2 === 0 ? 0 : -1);

function dribbled(clock, ending) {
  if (clock.share >= RUN_SHARE) {
    return { ...BALL_REST, spin: false };
  }

  return { x: playerAt(clock, ending).x + 13, y: BALL_REST.y, spin: true };
}

// charged, it rises off the grass and drifts a pixel or two toward the boot's swing
function charged(clock) {
  const rise = easeOut(phaseOf(clock.share, 0.15, 0.6));

  return {
    x: BALL_REST.x + Math.round(rise * 2),
    y: BALL_REST.y - Math.round(rise * LIFT) + (rise >= 1 ? bob(clock.ticks) : 0),
    spin: rise > 0.5,
  };
}

const hovering = (clock) => ({
  x: BALL_REST.x + 2,
  y: BALL_REST.y - LIFT + bob(clock.ticks),
  spin: true,
});

function inFlight(clock, ending) {
  return { ...flightPoint(ending, flightShare(clock)), spin: true };
}

function afterward(clock, ending) {
  const point = ballAfter(ending, afterTicks(clock)) ?? keeperAt(clock, ending).hands;

  return { ...point, spin: ending !== 'catch' && afterTicks(clock) < 90 };
}

const BY_STAGE = {
  awakening: dribbled,
  charge: charged,
  manifest: hovering,
  impact: (clock, ending) => (flightShare(clock) > 0 ? inFlight(clock, ending) : hovering(clock)),
  flight: inFlight,
  keeper: inFlight,
  collision: afterward,
  aftermath: afterward,
};

// the ball's middle in the world, and whether it spins
export const ballAt = (clock, ending) => BY_STAGE[clock.stage](clock, ending);
