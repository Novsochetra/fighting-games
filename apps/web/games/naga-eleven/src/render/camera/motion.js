import { clamp } from '../../sim/vector.js';
import { brakeForAim, brakeForRail, railOf } from './brakes.js';
import { HARD, keepInView, SCREEN } from './keep-in-view.js';
import { keepUpAcceleration } from './keep-up.js';
import { scaleAt } from './lens.js';

// a view whose pace changes by more than a fraction of a pixel a tick from one tick to the next
// reads as a whip, and a tilt sooner than a pan: however its springs and holds push it, the
// camera gathers and sheds pace no faster than this, in canvas pixels a tick, per tick. Only a
// ball flying faster than that lets it follow pans it harder (keep-up.js), up to `urgent`.
const MOST_ACCELERATION = { along: 0.25, depth: 0.2, urgent: 0.8 };

// the canvas pixels a world unit moves the view by: along, at the row the camera looks at; in
// depth, the rows the ground slides by
const pixelsPerUnit = (lens, depth) => ({
  along: scaleAt(lens, depth),
  depth: (lens.height * scaleAt(lens, depth) ** 2) / lens.focal,
});

// where the camera stood and how fast it went on the tick before, to ease this tick's move from
export const motionOf = (camera) => ({ along: { ...camera.along }, depth: { ...camera.depth } });

// the springs' own velocity runs a little ahead of the way the view really went while they gather
// pace, so the pace is eased from the camera's real last step (`pace`)
function easeAxis(axis, { before, aim, most }) {
  const { value, pace } = before;
  const wanted = brakeForAim(axis.value - value, { gap: aim - value, most: most.now });

  axis.value = value + clamp(wanted, pace - most.now, pace + most.now);
}

function holdOnRail(axis, { before, most, rail }) {
  const { value, pace } = before;
  const limits = { most: most.now, hardest: most.urgent };

  axis.value = value + brakeForRail(axis.value - value, { from: value, pace, rail, ...limits });
}

function mostOf(camera, { before, ball, rail }) {
  const perUnit = pixelsPerUnit(camera.lens, before.depth.value);
  const calm = {
    along: MOST_ACCELERATION.along / perUnit.along,
    depth: MOST_ACCELERATION.depth / perUnit.depth,
  };
  const keepUp = keepUpAcceleration({ camera: { ...camera, ...before }, ball, rail, calm });
  const axisMost = (axis) => {
    const urgent = MOST_ACCELERATION.urgent / perUnit[axis];

    return { now: clamp(keepUp[axis], calm[axis], urgent), urgent };
  };

  return { along: axisMost('along'), depth: axisMost('depth') };
}

// eases the move the springs and the soft hold made from `before`, then holds `ball` hard inside
// the view, which only a ball the camera could not keep up with ever needs, and brakes it all for
// the ends of the rail, so not even that hold runs the view into one; nothing takes the ball off
// the screen
export function easeMotion(camera, { before, ball }) {
  const rail = railOf(camera);
  const most = mostOf(camera, { before, ball, rail });
  const aim = { along: camera.aim.x, depth: camera.aim.y };
  const axes = ['along', 'depth'];

  for (const axis of axes) {
    easeAxis(camera[axis], { before: before[axis], aim: aim[axis], most: most[axis] });
  }

  keepInView(camera, ball, HARD);

  for (const axis of axes) {
    holdOnRail(camera[axis], { before: before[axis], most: most[axis], rail: rail[axis] });
  }

  keepInView(camera, ball, SCREEN);
}

// the springs keep a velocity of their own; where a hold or the easing moved the view from where
// they had it, it becomes the way the view really went, so they take over from there
function settleAxis(axis, { before, sprung }) {
  if (axis.value !== sprung.value) {
    axis.velocity = axis.value - before.value;
  }
}

export function settleMotion(camera, { before, sprung }) {
  settleAxis(camera.along, { before: before.along, sprung: sprung.along });
  settleAxis(camera.depth, { before: before.depth, sprung: sprung.depth });
}

export function notePace(camera, from) {
  camera.along.pace = camera.along.value - from.along.value;
  camera.depth.pace = camera.depth.value - from.depth.value;
}
