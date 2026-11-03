import { AI } from '../data/tuning.js';
import { interceptOf, runTo } from './brains/steering.js';
import { isHeld } from './input-state.js';
import { isLoose } from './loose-ball.js';
import { isHeldOver } from './stick-hold.js';
import { directionTo, distance, dot, lengthOf, normalized } from './vector.js';

const FIRST_TIME_PASS_REACH = 80;
const FIRST_TIME_PASS_TICKS = 24;
// how much the stick bends the run onto a pass, against the run's own pull to the ball
const STICK_PULL = 0.6;
// about 45 degrees either side of the way to where a loose ball can be met
const CHASE_CONE = 0.7;

const hasStick = (stick) => lengthOf(stick.x, stick.y) > 0;

export const meetsPass = (match, player) => player.receiving > 0 && match.ball.owner === null;

// a tap of pass as a pass reaches him is a pass played first time, not a change of man
export const canPassFirstTime = (match, player) =>
  meetsPass(match, player) && distance(player, match.ball) < FIRST_TIME_PASS_REACH;

export function readyFirstTimePass(player, stick) {
  Object.assign(player, {
    flick: FIRST_TIME_PASS_TICKS,
    flickAim: hasStick(stick) ? stick : null,
    strike: 0,
  });
}

// the readied pass goes the moment he has the ball, along the stick as it is then, or as it was
// when pass was tapped
export function firstTimePassOf(player, stick) {
  if (player.flick === 0) {
    return null;
  }

  const aim = hasStick(stick) ? stick : (player.flickAim ?? player.facing);

  player.flick = 0;

  return { kind: 'pass', aim, lofted: false, power: 0 };
}

function bend(move, stick) {
  const pace = Math.max(lengthOf(move.x, move.y), STICK_PULL);
  const way = normalized(move.x + stick.x * STICK_PULL, move.y + stick.y * STICK_PULL);

  return { x: way.x * pace, y: way.y * pace };
}

// a loose ball the player runs the steered man at is run onto the straightest way, as the
// computer's men run: the eight ways of the keys alone left him a step behind them every time
export function chasesLooseBall(match, player, stick) {
  if (!hasStick(stick) || !isLoose(match)) {
    return false;
  }

  return dot(directionTo(player, interceptOf(match, player)), stick) >= CHASE_CONE;
}

// the man a pass is on its way to, or the one control has just jumped to, runs onto the ball
// himself, whatever the stick still says from the man before, so the player never has to steer
// him under a ball they can hardly see land; once they move the stick it bends the run, so he can
// take the ball on into space
export function runOntoBall(match, player, { stick, action }) {
  const spot = interceptOf(match, player);
  const run = runTo(player, spot, distance(player, spot) > AI.sprintFrom / 2);
  const steering = hasStick(stick) && !isHeldOver(match, stick);

  return {
    move: steering ? bend(run.move, stick) : run.move,
    sprint: run.sprint || isHeld(match.input, 'sprint'),
    action,
  };
}
