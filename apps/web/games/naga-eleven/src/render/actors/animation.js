import { directionOf } from './directions.js';
import { intoPitch, isHoldingThrow } from './throw-in.js';

// a player at a walk or more is running; below it they stand
const RUN_SPEED = 0.35;

// the typical running speed, in world units a tick, that a run's fps is drawn for
const RUN_REFERENCE = 2.1;
// how long a thrower's arms stay thrown forward after the ball leaves them; a throw is the sim's
// kick of a player seen holding a throw-in within the last few ticks, however few frames drew him
const THROWN = { ticks: 12, heldWithin: 30 };

const speedOf = (player) => Math.sqrt(player.vx * player.vx + player.vy * player.vy);

const isRunning = (player) => speedOf(player) > RUN_SPEED;

// The camera looks across the pitch, so a dive along the goal line would be drawn flying at it or
// away; it is drawn as the sheets have it, a keeper flying forward, the way they face, out at the
// ball
function diveFacing(player) {
  return { x: (player.facing?.x ?? 1) >= 0 ? 1 : -1, y: 0.5 };
}

// a dive, a fall or a slide is on the ground and comes first
function groundedState(player, match, starts) {
  if (player.dive) {
    return { name: 'dive', age: match.tick - player.dive.tick, facing: diveFacing(player) };
  }

  if (player.stun > 0) {
    return { name: 'fall', age: match.tick - (starts.fall ?? match.tick) };
  }

  return player.tackle > 0
    ? { name: 'slide', age: match.tick - (starts.slide ?? match.tick) }
    : null;
}

// held over the head, then thrown: frame 0, then frame 1
function throwState(player, match, starts) {
  const kickAge = match.tick - player.lastKick;
  const isThrown =
    kickAge >= 0 &&
    kickAge < THROWN.ticks &&
    player.lastKick - (starts.throwHeld ?? -Infinity) <= THROWN.heldWithin;

  if (isHoldingThrow(match, player) || isThrown) {
    return { name: 'throw', age: isThrown ? 1 : 0, facing: intoPitch(match, player) };
  }

  return null;
}

function chosenState(player, match, { scoringTeam, starts, kick }) {
  const kickAge = Number.isFinite(player.lastKick) ? match.tick - player.lastKick : Infinity;
  const pose = groundedState(player, match, starts) ?? throwState(player, match, starts);

  if (pose) {
    return pose;
  }

  if (kickAge >= 0 && kickAge < kick.ticks) {
    return { name: 'kick', age: kickAge + kick.lead };
  }

  if (match.phase === 'goal' && player.team === scoringTeam) {
    return { name: 'celebrate', age: match.phaseTicks, loop: true, facing: { x: 0.2, y: 1 } };
  }

  return isRunning(player)
    ? { name: 'run', stride: player.stride, loop: true }
    : { name: 'idle', age: match.tick + player.index * 17, loop: true };
}

// what a player is doing, as an animation of the sheet, and which way it is drawn; `context` is
// { scoringTeam, starts (memory.js), kick (kickTimingOf) }
export function animationOf(player, match, context) {
  const state = chosenState(player, match, context);

  return {
    ...state,
    fallback: isRunning(player) ? 'run' : 'idle',
    direction: directionOf(state.facing ?? player.facing ?? { x: 1, y: 0 }),
  };
}

const ticksPerFrame = (animation) => 60 / animation.fps;

// an action plays once and holds its last frame; a run steps with the ground covered
export function frameOf(animation, state) {
  const last = animation.frames - 1;

  if (state.stride !== undefined) {
    const span = RUN_REFERENCE * ticksPerFrame(animation);

    return Math.floor(state.stride / span) % animation.frames;
  }

  const frame = Math.max(0, Math.floor(state.age / ticksPerFrame(animation)));

  return state.loop ? frame % animation.frames : Math.min(frame, last);
}

// The sim marks a kick on the tick the ball leaves the foot, so a kick of three frames or more,
// whose first is the back-swing, plays from its second: `lead` skips the frames before the strike,
// and `ticks` is how long the rest shows
export function kickTimingOf(animations) {
  const { kick } = animations;

  if (!kick) {
    return { ticks: 0, lead: 0 };
  }

  const lead = kick.frames >= 3 ? ticksPerFrame(kick) : 0;

  return { ticks: kick.frames * ticksPerFrame(kick) - lead, lead };
}

// an animation the sheet lacks stands in with the run or the idle
export function animationName(animations, state) {
  const choices = [state.name, state.fallback, 'idle', 'run'];

  return choices.find((name) => animations[name]) ?? Object.keys(animations)[0];
}
