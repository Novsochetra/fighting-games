import * as CAMERA from '../camera.js';
import { smoothStep } from '../camera/smooth.js';

// a replay's camera stays on the ball, a little ahead of where it is going, on springs as the live
// camera is, so it glides after the ball instead of snapping to each touch; slower in depth, where
// a broadcast camera barely tilts. The look ahead makes up most of what the springs trail by, so
// a long ball stays near the middle of the view.
const LOOK_AHEAD = { x: 14, y: 6 };
const SMOOTH = { x: 20, y: 32 };
const GOAL_SHAKE = 6;

const canFollow = (api) =>
  ['createCamera', 'updateCamera', 'panCamera'].every((name) => typeof api[name] === 'function');

function targetOf(frame) {
  const { ball } = frame;

  return { x: ball.x + (ball.vx ?? 0) * LOOK_AHEAD.x, y: ball.y + (ball.vy ?? 0) * LOOK_AHEAD.y };
}

const focusAt = (follow) => ({ x: follow.focus.x.value, y: follow.focus.y.value });

// the camera is the drawing helper's (src/render/camera.js), moved only by its own panCamera, so
// it keeps to the ground the venue drew; with no such camera there is nothing to follow with
export function createFollowCamera(frame, api = CAMERA) {
  if (!canFollow(api)) {
    return null;
  }

  const camera = api.createCamera(frame);
  const target = targetOf(frame);
  const focus = { x: { value: target.x, velocity: 0 }, y: { value: target.y, velocity: 0 } };

  api.panCamera(camera, { ...target, ticks: 1 });
  api.updateCamera(camera, frame);

  return { camera, focus, api };
}

export function followBall(follow, frame) {
  if (!follow) {
    return;
  }

  const { camera, focus, api } = follow;
  const target = targetOf(frame);

  smoothStep(focus.x, target.x, SMOOTH.x);
  smoothStep(focus.y, target.y, SMOOTH.y);
  api.panCamera(camera, { ...focusAt(follow), ticks: 1 });

  if (frame.events.some((event) => event.type === 'goal')) {
    api.shakeCamera?.(camera, GOAL_SHAKE);
  }

  api.updateCamera(camera, frame);
}
