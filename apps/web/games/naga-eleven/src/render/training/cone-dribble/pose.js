import { lengthOf } from '../../../sim/vector.js';
import { directionOf } from '../../actors/directions.js';
import { netSpot } from './goal.js';

// under this, in world units a tick, he has come to a stop and stands
const MOVING = 0.3;

const AFTER_THE_LINE = new Set(['finish', 'result', 'done']);

// once over the line he turns to the net he strikes the ball into, and watches it go in
function facingOf(state) {
  const { runner, finished, course } = state.run;

  if (!finished || !AFTER_THE_LINE.has(state.phase)) {
    return runner.facing;
  }

  const net = netSpot(course.goalX);

  return { x: net.x - runner.x, y: net.y - runner.y };
}

// past the line the drill no longer counts his stride, so the ground he runs on is added to it
const strideOf = ({ runner, finishedAt }) =>
  runner.stride + (finishedAt ? Math.abs(runner.x - finishedAt.x) : 0);

// what the runner does, as one of the match's animations, and the way he faces: along his run,
// so right running right and three-quarters on as he weaves up or down; `kick` is the art's
// kick timing (kickTimingOf)
export function runnerPose(state, kick) {
  const { runner, finished } = state.run;
  const direction = directionOf(facingOf(state));
  const striking = finished && state.phase === 'finish' && state.phaseTicks < kick.ticks;

  if (striking) {
    return { name: 'kick', age: state.phaseTicks + kick.lead, fallback: 'run', direction };
  }

  if (lengthOf(runner.vx, runner.vy) > MOVING) {
    return { name: 'run', stride: strideOf(state.run), loop: true, fallback: 'run', direction };
  }

  return { name: 'idle', age: state.tick, loop: true, fallback: 'idle', direction };
}
