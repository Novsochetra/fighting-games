import { TICKS_PER_SECOND } from '../../config.js';
import { createFollowCamera, followBall } from './follow-camera.js';
import { createFrameMatch, showFrame } from './frame-match.js';
import { recordedFrames } from './recorder.js';

// how much of the tape a goal replay shows: four seconds up to the goal, the last two at half
// speed, and a little after it of the ball in the net
const PLAN = {
  fromTicksBefore: 4 * TICKS_PER_SECOND,
  slowTicks: 2 * TICKS_PER_SECOND,
  afterTicks: 50,
  slowRate: 0.5,
};

const hasGoal = (snapshot) => snapshot.events.some((event) => event.type === 'goal');

// the newest goal on the tape, or its newest frame when there is none
function goalIndexOf(frames) {
  const found = frames.findLastIndex(hasGoal);

  return found === -1 ? frames.length - 1 : found;
}

function cut(recorded, plan) {
  const goal = goalIndexOf(recorded);
  const first = Math.max(0, goal - plan.fromTicksBefore);
  const last = Math.min(recorded.length - 1, goal + plan.afterTicks);

  return { frames: recorded.slice(first, last + 1), goalAt: goal - first };
}

function show(replay) {
  const { frames, position } = replay;
  const index = Math.min(frames.length - 1, Math.floor(position));

  if (index < 0) {
    return;
  }

  showFrame(replay.frame, {
    from: frames[index],
    to: frames[index + 1],
    share: position - index,
    fresh: index !== replay.shown,
  });
  replay.shown = index;
}

// `fromTicksBefore` sets how long before the goal it starts; the tape is copied, so the match
// can record on while it plays; `camera` is the camera API to follow with (src/render/camera.js)
export function createReplay(recorder, options = {}) {
  const plan = { ...PLAN, ...options };
  const { frames, goalAt } = cut(recordedFrames(recorder), plan);
  const replay = {
    frames,
    goalAt,
    slowFrom: goalAt - plan.slowTicks,
    slowRate: plan.slowRate,
    position: 0,
    age: 0,
    shown: -1,
    done: frames.length === 0,
    skipped: false,
    frame: createFrameMatch(recorder.cast ?? undefined),
  };

  show(replay);
  replay.follow = replay.done ? null : createFollowCamera(replay.frame, options.camera);

  return replay;
}

export const isSlowMotion = (replay) =>
  replay.position >= replay.slowFrom && replay.position < replay.goalAt;

export const speedOf = (replay) => (isSlowMotion(replay) ? replay.slowRate : 1);

export const isReplayDone = (replay) => replay.done;

export function skipReplay(replay) {
  replay.done = true;
  replay.skipped = true;
}

// once a tick; a press of pass (or skip) ends it there
export function stepReplay(replay, input = {}) {
  if (replay.done) {
    return replay;
  }

  if (input.pass || input.confirm || input.skip) {
    skipReplay(replay);

    return replay;
  }

  const next = replay.position + speedOf(replay);

  replay.age += 1;

  if (next > replay.frames.length - 1) {
    replay.done = true;

    return replay;
  }

  replay.position = next;
  show(replay);
  followBall(replay.follow, replay.frame);

  return replay;
}

export const replayFrameMatch = (replay) => replay.frame;

export const replayCamera = (replay) => replay.follow?.camera ?? null;

// ticks left to play at the speed it is going, for the chrome's closing wipe
export const ticksLeft = (replay) =>
  Math.max(0, Math.ceil((replay.frames.length - 1 - replay.position) / speedOf(replay)));
