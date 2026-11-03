import { PHASE_TICKS } from '../data/tuning.js';
import { rollOut } from './ball.js';
import { standStill } from './brains/steering.js';
import { resetPlay } from './combos/reset.js';
import { pushEvent } from './events.js';
import { setKickoff, walkToKickoff } from './kickoff.js';
import { moveAll } from './movement.js';
import { enter } from './phase-state.js';
import { areasOf } from './pitch.js';

// the football minute shown: 0 at kick off, the format's half at half time, double it at the end
export function minuteOf(match) {
  const played = (match.halfTicks - match.clock) / match.halfTicks;

  return Math.floor((match.half - 1 + played) * areasOf(match).halfMinutes);
}

const secondHalfKickoff = (match) => 1 - match.firstKickoff;

export function endHalf(match) {
  const final = match.half === 2;

  resetPlay(match);
  match.ball.owner = null;
  match.restart = null;
  enter(match, final ? 'over' : 'halfTime');
  pushEvent(match, { type: 'whistle', kind: final ? 'fullTime' : 'halfTime', half: match.half });
}

export function countDown(match) {
  match.clock = Math.max(0, match.clock - 1);

  if (match.clock === 0) {
    endHalf(match);
  }
}

// the players walk to their places for the second half; the other side kicks it off
export function halfTimeTick(match) {
  walkToKickoff(match, secondHalfKickoff(match));
  rollOut(match);

  if (match.phaseTicks >= PHASE_TICKS.halfTime) {
    match.half = 2;
    match.clock = match.halfTicks;
    setKickoff(match, secondHalfKickoff(match));
  }
}

export function overTick(match) {
  moveAll(match, match.players.map(standStill));
  rollOut(match);
}
